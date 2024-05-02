import { Endpoint } from '../enums/endpoint.enum';
import { BaseClient } from '../ws-base-client';

export class WSOrdersClient extends BaseClient<Endpoint.orders> {
  constructor() {
    super(Endpoint.orders);
  }
}
