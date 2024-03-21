import { DOMParser } from '@xmldom/xmldom';
import { Parser } from 'xml2js-cdata';
import { create } from 'xmlbuilder2';
import { Config } from './types/config.type';
import { Entity, EntityWritable } from './types/entity-mapping.type';
import { wsConfig } from './ws-config';
import { endpointNodes } from './xml/endpoint-nodes';
import { getLanguageValues } from './xml/xml.interfaces';

/**
 *
 */
export interface RequestOptions {
  id?: string;
  query?: Record<string, string>;
}

export class BaseClient<T extends keyof Entity> {
  private languageIds: number | number[] = -1;
  private requiredNodes: string[] = [];
  private readOnlyNodes: string[] = [];
  private localizedNodes: string[] = [];

  constructor(private readonly endpoint: T) {}

  /**
   *
   * @param {string} endpoint - Endpoint
   * @param {RequestOptions} options - Query parameters
   */
  getUrl(endpoint: string, options?: RequestOptions) {
    let urlWithParams: string = `${this.getConfig().url}/api/${endpoint}`;
    if (options?.id) {
      urlWithParams = `${urlWithParams}/${options.id}`;
    }
    if (options?.query) {
      const params = Object.keys(options.query).reduce((acc, key) => {
        if (options?.query?.[key] !== undefined) {
          acc.push(`${key}=${options.query[key]}`);
        }
        return acc;
      }, [] as string[]);
      urlWithParams = `${urlWithParams}?${params.join('&')}`;
    }
    return urlWithParams;
  }

  /**
   * TODO encode key
   *
   * @param str
   */
  encode(str: string): string {
    return btoa(this.getConfig().key);
  }

  getDefaultHeaders(): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    return headers;
  }

  /**
   *
   * @param {Partial<EntityWritable>} entityData - Data for the entity to be created
   */
  async create(entityData: Partial<EntityWritable[T]>): Promise<Entity[T]> {
    if (this.getRequiredFields().length == 0) {
      //async ressources
      await this.initSpecificEntityFieldsIndicators();
    }
    const entity: Entity[T] = await this.getBlank();
    this.fillFields(entity, entityData);
    this.removeReadOnlyFields(entity, entityData);

    const entityNodeName: string = this.getNodeName() ?? '';
    const xml: string = create({
      prestashop: { [entityNodeName]: entity },
    }).end({
      prettyPrint: true,
    });

    const response: Response = await fetch(
      this.getUrl(this.getEndPoint(), {
        query: {
          ws_key: this.getConfig().key,
          output_format: 'JSON',
          display: 'full',
        },
      }),
      {
        method: 'POST',
        mode: 'cors',
        headers: this.getDefaultHeaders(),
        body: xml,
      },
    );
    const result = await response.json();
    return result[this.getEndPoint()][0] as Entity[T];
  }

  /**
   *
   * @param { string } id - ID's entity
   */
  async get(id: string): Promise<Entity[T]> {
    const response: Response = await fetch(
      this.getUrl(this.getEndPoint(), {
        id: id,
        query: {
          ws_key: this.getConfig().key,
          output_format: 'JSON',
          display: 'full',
        },
      }),
      {
        method: 'GET',
        mode: 'cors',
        headers: this.getDefaultHeaders(),
      },
    );
    const json = await response.json();
    return json[this.getEndPoint()][0] as Entity[T];
  }

  async getAll(): Promise<Entity[T]> {
    const response: Response = await fetch(
      this.getUrl(this.getEndPoint(), {
        query: {
          ws_key: this.getConfig().key,
          output_format: 'JSON',
          display: 'full',
        },
      }),
      {
        method: 'GET',
        mode: 'cors',
        headers: this.getDefaultHeaders(),
      },
    );
    const json = await response.json();
    return json[this.getEndPoint()][0] as Entity[T];
  }

  /**
   *
   * @param {Partial<EntityWritable>} entityData - Data for the entity to be updated
   */
  async update(entityData: Partial<EntityWritable[T]>): Promise<Entity[T]> {
    if (this.getRequiredFields().length == 0) {
      //async ressources
      await this.initSpecificEntityFieldsIndicators();
    }
    const entityId = entityData.id;
    const entity: Entity[T] = await this.get(entityId!.toString());
    this.fillFields(entity, entityData);
    this.removeReadOnlyFields(entity, entityData);

    const entityNodeName: string = this.getNodeName() ?? '';
    const xml: string = create({
      prestashop: { [entityNodeName]: entity },
    }).end({
      prettyPrint: true,
    });

    const response: Response = await fetch(
      this.getUrl(this.getEndPoint(), {
        query: {
          ws_key: this.getConfig().key,
          output_format: 'JSON',
          display: 'full',
        },
      }),
      {
        method: 'PUT',
        mode: 'cors',
        headers: this.getDefaultHeaders(),
        body: xml,
      },
    );
    return (await response.json()) as Entity[T];
  }

  async delete(id: string): Promise<number> {
    const response: Response = await fetch(
      this.getUrl(this.getEndPoint(), {
        id: id,
        query: {
          ws_key: this.getConfig().key,
        },
      }),
      {
        method: 'DELETE',
        mode: 'cors',
        headers: this.getDefaultHeaders(),
      },
    );
    return response.status;
  }

  /**
   * ?schema=synopsis: returns a blank XML tree of the chosen resource, with the format that is expected for each value
   * and specific indicators (ie, if the node is required, read only, multilanguage).
   *
   * No json format
   *
   * return the synopsis XML as string
   */
  async getSynopsis(): Promise<string> {
    const xmlParser = new Parser();
    // TODO
    // The category synopsis for version 1.7.x of PS is not correct
    // Recover the category synopsis from an xml file

    const response: Response = await fetch(
      this.getUrl(this.getEndPoint(), {
        query: {
          ws_key: this.getConfig().key,
          schema: 'synopsis',
        },
      }),
      {
        method: 'GET',
        mode: 'no-cors',
        headers: this.getDefaultHeaders(),
      },
    );
    return await response.text();
  }

  async getSynopsisNodeList() {
    const synopsis = await this.getSynopsis();
    const domParser: DOMParser = new DOMParser();
    const xmlDocument: Document = domParser.parseFromString(
      synopsis,
      'application/xml',
    );

    const rootElt = xmlDocument.documentElement;
    const endpointElt: Element = rootElt.getElementsByTagName(
      this.getNodeName()!,
    )[0];
    return endpointElt.childNodes;
  }

  /**
   * ?schema=blank: returns a blank Json tree of the chosen resource.
   */
  async getBlank(): Promise<Entity[T]> {
    const response: Response = await fetch(
      this.getUrl(this.getEndPoint(), {
        query: {
          ws_key: this.getConfig().key,
          schema: 'blank',
          output_format: 'JSON',
          display: 'full',
        },
      }),
      {
        method: 'GET',
        mode: 'no-cors',
        headers: this.getDefaultHeaders(),
      },
    );

    const json = await response.json();
    return json[this.getEndPoint()][0] as Entity[T];
  }

  /**
   * Initializes languages and specific fields indicators (ie, if the field is required, read only)
   */
  async initSpecificEntityFieldsIndicators() {
    // languages
    this.languageIds = await this.getShopLanguages();

    // required, read only synopsis node list
    this.initSpecificNodeIndicators(await this.getSynopsisNodeList());
  }

  /**
   * fill fields and check that the mandatory fields are filled in
   *
   * @param {Entity} entity - The blank entity
   * @param {Partial<EntityWritable>} entityData - Data for the entity to be created
   */
  fillFields(entity: Entity[T], entityData: Partial<EntityWritable[T]>) {
    const requiredFieldsFound: string[] = [];

    for (const property of Object.keys(entityData)) {
      if (
        this.getLocalizedFields().includes(property) &&
        typeof entityData[property] == 'string'
      ) {
        entity[property] = getLanguageValues({
          id: Number(this.getLanguageIds()[0]),
          value: entityData[property],
        });
      } else {
        entity[property] = entityData[property];
      }

      // requiered field
      if (this.getRequiredFields().includes(property)) {
        requiredFieldsFound.push(property);
      }
    }
    // error
    if (this.getRequiredFields().length != requiredFieldsFound.length) {
      this.requiredFieldNotFoundException(requiredFieldsFound);
    }
  }

  removeReadOnlyFields(
    entity: Partial<Entity[T]>,
    entityData: Partial<EntityWritable[T]>,
  ) {
    for (const property in entity) {
      if (
        this.isReadOnlyField(property) ||
        (this.isNotRequiredField(property) &&
          this.isNotUpdatedField(property, entityData))
      ) {
        delete entity[property];
      }
    }
  }

  /**
   *
   * @param property
   */
  isReadOnlyField(property: string): boolean {
    return this.readOnlyNodes.includes(property);
  }

  isNotRequiredField(property: string) {
    return !this.getRequiredFields().includes(property);
  }

  isNotUpdatedField(
    property: string,
    shopContentData: Partial<EntityWritable[T]>,
  ) {
    return !shopContentData[property];
  }

  async getShopLanguages(): Promise<number[]> {
    const response: Response = await fetch(
      this.getUrl('languages', {
        query: {
          ws_key: this.getConfig().key,
          output_format: 'JSON',
          display: 'full',
        },
      }),
      {
        method: 'GET',
        mode: 'no-cors',
        headers: this.getDefaultHeaders(),
      },
    );

    const json = await response.json();
    const langArr: number[] = [];
    if (json.languages.length > 0) {
      const languages = json?.languages ? json.languages : [];
      for (const language of languages) {
        langArr.push(parseInt(language.id));
      }
    }
    return langArr;
  }

  /**
   * Initializes and returns an array of paths from the given list of nodes.
   * Browse the synopsis XML in depth and return the flattened tree
   *
   * @param {NodeList} nodes - The list of nodes to process.
   * @param {string} [path] - The optional path.
   * @return {string[]} - An array of paths.
   */
  initSpecificNodeIndicators(nodes: NodeList, path?: string): string[] {
    let paths: string[] = [];
    let _path: string = path!;

    for (const node of Array.from(nodes)) {
      if (node.nodeType == node.ELEMENT_NODE) {
        const elt: Element = node as Element;
        _path = path ? path + '.' + elt.nodeName : elt.nodeName;
        this.pushSpecificNodeIndicators(elt, _path);
        if (node.hasChildNodes() && 'language' != node.firstChild?.nodeName) {
          paths.push(
            ...this.initSpecificNodeIndicators(node.childNodes, _path),
          );
        } else {
          paths.push(_path);
        }
      }
    }
    console.log(paths);
    return paths;
  }

  /**
   *
   * @param {Element} elt
   * @param {string} path
   */
  pushSpecificNodeIndicators(elt: Element, path: string) {
    if (elt.getAttribute('required')) {
      this.getRequiredFields().push(path);
    }
    if (elt.getAttribute('read_only') || elt.getAttribute('readOnly')) {
      this.getReadOnlyFields().push(path);
    }
    if ('language' == elt.firstChild?.nodeName) {
      // path.substring(0, path.length - '.language'.length),
      this.getLocalizedFields().push(path);
    }
  }

  requiredFieldNotFoundException(requiredFieldsFound: string[]): never {
    let msg: string = `The following propertie(s) of ${endpointNodes.get(
      this.getEndPoint(),
    )} are required: \n`;
    for (const property of this.getRequiredFields()) {
      if (!requiredFieldsFound.includes(property)) {
        msg += `* ${property}\n`;
      }
    }
    throw new Error(msg);
  }

  getConfig(): Config {
    return { url: wsConfig.url, key: wsConfig.key };
  }

  getEndPoint() {
    return this.endpoint;
  }

  getNodeName() {
    return endpointNodes.get(this.getEndPoint());
  }

  getLanguageIds(): number | number[] {
    return this.languageIds;
  }

  getRequiredFields(): string[] {
    return this.requiredNodes;
  }

  getReadOnlyFields(): string[] {
    return this.readOnlyNodes;
  }

  getLocalizedFields(): string[] {
    return this.localizedNodes;
  }
}
