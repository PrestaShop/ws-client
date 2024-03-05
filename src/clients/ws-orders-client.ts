import { Endpoint } from '../enums/endpoint.enum';
import { BaseClient } from '../ws-base-client';

export class WsOrdersClient extends BaseClient<Endpoint.orders> {
  constructor() {
    super(Endpoint.orders);
  }
}
