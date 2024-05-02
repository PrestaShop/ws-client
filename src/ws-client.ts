import { WSCategoriesClient } from './clients/ws-categories-client';
import { WSOrdersClient } from './clients/ws-orders-client';
import { WSProductsClient } from './clients/ws-products-client';
import { init } from './ws-config';

export class WSClient {
  public categories: WSCategoriesClient;
  public orders: WSOrdersClient;
  public products: WSProductsClient;

  constructor(
    private readonly url: string,
    private readonly key: string,
  ) {
    init(url, key);
    this.categories = new WSCategoriesClient();
    this.orders = new WSOrdersClient();
    this.products = new WSProductsClient();
  }
}
