import { Endpoint } from '../enums/endpoint.enum';
import { BaseClient } from '../ws-base-client';

export class WSCategoriesClient extends BaseClient<Endpoint.categories> {
  constructor() {
    super(Endpoint.categories);
  }
}
