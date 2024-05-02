import { Endpoint } from '../enums/endpoint.enum';
import { BaseClient } from '../ws-base-client';

export class WSProductsClient extends BaseClient<Endpoint.products> {
  constructor() {
    super(Endpoint.products);
  }
}
