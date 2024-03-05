import { WsCategoriesClient } from './clients/ws-categories-client';
import { WsOrdersClient } from './clients/ws-orders-client';
import { WsProductsClient } from './clients/ws-products-client';
import { init } from './ws-config';

export class WsClient {
  public categories: WsCategoriesClient;
  public orders: WsOrdersClient;
  public products: WsProductsClient;

  constructor(
    private readonly url: string,
    private readonly key: string,
  ) {
    init(url, key);
    this.categories = new WsCategoriesClient();
    this.orders = new WsOrdersClient();
    this.products = new WsProductsClient();
  }
}
