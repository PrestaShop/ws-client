import { Category, CategoryWritable } from './ws-entities/categories.type';
import { Order } from './ws-entities/orders.type';
import { Product, ProductWritable } from './ws-entities/products.type';

export type Entity = {
  categories: Category;
  orders: Order;
  products: Product;
};

export type EntityWritable = {
  categories: CategoryWritable;
  orders: Order;
  products: ProductWritable;
};
