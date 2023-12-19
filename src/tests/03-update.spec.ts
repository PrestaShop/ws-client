import { describe, it } from 'node:test';
import { Endpoint } from '../endpoint.enum';
import { Category } from '../types/ws-entities/categories.type';
import { WSClient, WsConfig } from '../ws-client';
import { categoryMultilanguage } from './categories-sample';
import { testConfig } from './test.config';

describe('WS client update', () => {
  it('Update a category', async () => {
    const wsClient = new WSClient(
      Endpoint.categories,
      testConfig.get('config') as WsConfig,
    );
    const category: Category = await wsClient.update(categoryMultilanguage);
    console.log(`Get category (id=4} created at ${category.date_add}`);

    const id = category.id;
    const date_add = category.date_add;

    console.log(id, date_add);
    expect(category.id).not.toBeNull();
  });
});
