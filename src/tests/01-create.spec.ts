import { describe, it } from 'node:test';
import { Endpoint } from '../endpoint.enum';
import { Category } from '../types/ws-entities/categories.type';
import { WSClient, WsConfig } from '../ws-client';
import { newCategory } from './categories-sample';
import { testConfig } from './test.config';

describe('WS client: create', () => {
  it('Add new category', async () => {
    const wsClient = new WSClient(
      Endpoint.categories,
      testConfig.get('config') as WsConfig,
    );
    // The type of newCategory is CategoryWritable
    const category: Category = await wsClient.create(newCategory);
    console.log(
      `New category (id=${category.id} created at ${category.date_add}`,
    );

    expect(category.id).not.toBeNull();
  });
});
