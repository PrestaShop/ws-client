import { Endpoint } from '../enums/endpoint.enum';
import { BaseClient } from '../ws-base-client';

export class WsCategoriesClient extends BaseClient<Endpoint.categories> {
  constructor() {
    super(Endpoint.categories);
  }
}
