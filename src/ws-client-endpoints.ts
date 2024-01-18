import { Endpoint } from './enums/endpoint.enum';
import { WSClient } from './ws-client';

export const categories = new WSClient(Endpoint.categories);

export const orders = new WSClient(Endpoint.orders);

export const products = new WSClient(Endpoint.products);
