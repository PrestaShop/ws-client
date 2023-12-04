import axios, { AxiosResponse } from 'axios';
import fetch, { Response } from 'node-fetch';
import { Parser } from 'xml2js-cdata';
import { create } from 'xmlbuilder2';
import { endpointNodes } from './endpoint-nodes';
import { ApiParams } from './types/api';
import { Config } from './types/config.type';
import { Entity, EntityWritable } from './types/entity-mapping.type';

/**
 * EntityWritableMapping
 * EntityMapping
 */
export class WSClient<T extends keyof Entity> {
  // only if create/update
  private languageIds: string | string[] = '';
  private requiredFields: string[] = [];
  private readOnlyFields: string[] = [];
  private localizedFields: string[] = [];
  private synopsis; //XML (no json format)

  // /!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\/!\
  // langues du BO en param ? suivant s'il s'agit d'un multilanguage ou non le json n'est pas formaté de la meme manière
  // constructor(private readonly endpoint : T, languages:string | string[]) {
  constructor(
    private readonly endpoint: T,
    private config: Config,
  ) {}

  setConfig(config: Config) {
    this.config = config;
  }

  call = async ({ method, path, params, headers, body }: ApiParams) => {
    const response: Response = await fetch({
      method,
      url: `${this.config.url}/api/${path}`,
      headers,
      params: {
        ...params,
        ws_key: this.config.url,
        output_format: 'JSON',
      },
      data: body,
    }).catch((error: Error) => {
      return error;
    });

    return response;
  };

  async create(entityData: Partial<EntityWritable[T]>): Promise<Entity[T]> {
    if (this.synopsis == undefined) {
      await this.init();
    }
    const entity: Entity[T] = await this.getBlank();
    this.fillFields(entity, entityData);
    this.removeReadOnlyFields(entity, entityData);
    this.fillAssociations(entity, entityData);

    const entityNodeName: string = endpointNodes.get(this.endpoint) ?? '';
    const xml: string = create({
      prestashop: { [entityNodeName]: entity },
    }).end({
      prettyPrint: true,
    });
    // console.log(`xml: ${xml}`);
    let response: AxiosResponse;
    try {
      response = await axios({
        method: 'post',
        url: `${this.config.url}/api/${this.endpoint}`,
        headers: { 'Content-Type': 'text/xml' },
        params: {
          ws_key: this.config.wsKey,
          output_format: 'JSON',
        },
        data: xml,
      });
    } catch (error: unknown) {
      console.log(error);
      throw error;
    }
    // console.log(`created response: ${response.data[endpoint][0]}`);

    console.log(
      `[NEW] ${this.endpoint} WS response status: ${response.status} (${response.statusText})`,
    );
    // console.log(`response: ${response.data}`);
    const elt: string = endpointNodes.get(this.endpoint)!;
    return response.data[elt]; //cart_rule, category
  }

  /**
   * no json format
   */
  async getSynopsis(): Promise<Entity[T]> {
    const xmlParser = new Parser();
    // TODO
    // The category synopsis for version 1.7.x of PS is not correct
    // Recover the category synopsis from an xml file

    let response: AxiosResponse;
    try {
      response = await axios({
        method: 'get',
        url: `${this.config.url}/api/${this.endpoint}`,
        params: {
          schema: 'synopsis',
          display: 'full',
          ws_key: this.config.wsKey,
        },
      });
    } catch (error: unknown) {
      console.log(error);
      throw error;
    }

    const elt = endpointNodes.get(this.endpoint);
    const synopsis = await xmlParser.parseStringPromise(response.data);

    return synopsis.prestashop[elt][0];
  }

  async getBlank(): Promise<Entity[T]> {
    let response: AxiosResponse;
    try {
      response = await axios({
        method: 'get',
        url: `${this.config.url}/api/${this.endpoint}`,
        params: {
          schema: 'blank',
          display: 'full',
          ws_key: this.config.wsKey,
          output_format: 'JSON',
        },
      });
    } catch (error: unknown) {
      console.log(error);
      throw error;
    }

    // const elt: string = endpointNodes.get(this.endpoint)!;
    return response.data[this.endpoint][0];
  }

  async init() {
    this.languageIds = await this.getShopLanguages();
    this.synopsis = await this.getSynopsis();
    this.initAttributeFields();
  }

  traverseTree(
    entity: Partial<Entity[T]> | Partial<EntityWritable[T]>,
    parentKey?: string,
  ): string[] {
    let keys: string[] = [];

    Object.keys(entity).forEach((key) => {
      const value = entity[key];
      const _key: string = parentKey ? parentKey + '.' + key : key;
      if (this.hasChild(value)) {
        keys.push(...this.traverseTree(value, _key));
        console.log(typeof value);
        // this.traverseTree(node);
      } else {
        keys.push(key);
        console.log(key);
      }
    });
    return keys;
  }

  hasChild(node) {
    return typeof node === 'object' && Object.keys(node).length > 0;
  }
  /**
   * fill fields and check that the mandatory fields are filled in
   *
   * @param entity
   * @param entityData
   */
  fillFields(entity: Entity[T], entityData: Partial<EntityWritable[T]>) {
    const requiredFieldsFound: string[] = [];

    for (const property of Object.keys(entityData)) {
      if ('associations' !== property) {
        entity[property] = entityData[property];
      }

      // requiered field
      if (this.requiredFields.includes(property)) {
        requiredFieldsFound.push(property);
      }
    }

    // error
    if (this.requiredFields.length != requiredFieldsFound.length) {
      this.requiredFieldNotFoundException(requiredFieldsFound);
    }
  }

  fillAssociations(entity: Entity[T], entityData: Partial<EntityWritable[T]>) {
    // TODO associations element
    delete entity['associations'];
    if (entityData['associations']) {
      entity['associations'] = entityData['associations'];
    }
  }

  removeReadOnlyFields(
    entity: Partial<Entity[T]>,
    entityData: Partial<EntityWritable[T]>,
  ) {
    for (const property in entity) {
      if (
        this.isReadOnlyField(property) ||
        this.isNotRequiredAndNotUpdatedField(property, entityData)
      ) {
        delete entity[property];
      }
    }
  }

  isReadOnlyField(property: string) {
    return this.readOnlyFields.includes(property);
  }

  isNotRequiredAndNotUpdatedField(
    property: string,
    shopContentData: Partial<EntityWritable[T]>,
  ) {
    return (
      !this.requiredFields.includes(property) && !shopContentData[property]
    );
  }

  async getShopLanguages(): Promise<string[]> {
    let response: AxiosResponse;
    try {
      response = await axios({
        method: 'get',
        url: `${this.config.url}/api/languages`,
        params: {
          display: 'full',
          ws_key: this.config.wsKey,
          output_format: 'JSON',
        },
      });
    } catch (error: unknown) {
      console.log(error);
      throw error;
    }

    const langArr: string[] = [];
    if (response.data.languages.length > 0) {
      const languages = response.data?.languages ? response.data.languages : [];
      for (const language of languages) {
        langArr.push(language.id);
      }
    }
    return langArr;
  }

  initAttributeFields() {
    for (const property of Object.keys(this.synopsis)) {
      if (
        this.synopsis[property][0].$?.required != undefined &&
        this.synopsis[property][0].$.required == 'true'
      ) {
        this.requiredFields.push(property);
      } else if (
        (this.synopsis[property][0].$?.readOnly != undefined &&
          this.synopsis[property][0].$.readOnly == 'true') ||
        (this.synopsis[property][0].$?.read_only != undefined &&
          this.synopsis[property][0].$.read_only == 'true')
      ) {
        this.readOnlyFields.push(property);
      }
      if (this.synopsis[property][0]?.language != undefined) {
        this.localizedFields.push(property);
      }
      //TODO assiciations element
    }
  }

  requiredFieldNotFoundException(requiredFieldsFound: string[]): never {
    let msg: string = `The following propertie(s) of ${endpointNodes.get(
      this.endpoint,
    )} are required: \n`;
    for (const property of this.requiredFields) {
      if (!requiredFieldsFound.includes(property)) {
        msg += `* ${property}\n`;
      }
    }
    throw new Error(msg);
  }

  private getConfig(): Config {
    return this.config;
  }
}
