import { describe, it } from 'node:test';
import { Endpoint } from '../endpoint.enum';
import { Category } from '../types/ws-entities/categories.type';
import { WSClient, WsConfig } from '../ws-client';
import { testConfig } from './test.config';

describe('WS client: read', () => {
  it('Get a category', async () => {
    const wsClient = new WSClient(
      Endpoint.categories,
      testConfig.get('config') as WsConfig,
    );
    const category: Category = await wsClient.get('4');
    console.log(`Get category (id=4} created at ${category.date_add}`);

    expect(category.id).not.toBeNull();
  });
});
