import { describe, it } from 'node:test';
import { Endpoint } from '../endpoint.enum';
import { Category } from '../types/ws-entities/categories.type';
import { WSClient, WsConfig } from '../ws-client';

describe('WS client: read', () => {
  it('Get a category', async () => {
    const config: WsConfig = {
      url: 'http://localhost:8000',
      wsKey: 'GENERATE_A_COMPLEX_VALUE_WITH_32',
    };
    const wsClient = new WSClient(Endpoint.categories, config);
    const category: Category = await wsClient.get('4');
    console.log(`Get category (id=4} created at ${category.date_add}`);

    expect(category.id).not.toBeNull();
  });
});
