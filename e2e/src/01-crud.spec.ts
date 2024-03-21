import { describe, it } from 'node:test';
import { Category } from '../../src/types/ws-entities/categories.type';
import { WsClient } from '../../src/ws-client';
import { testConfig } from '../test.config';
import {
  categoryMultilanguage,
  newCategory,
} from './fixtures/categories-sample';

describe('WS client: create', () => {
  it('Get a category', async () => {
    const client = new WsClient(
      testConfig.get('config').url,
      testConfig.get('config').key,
    );
    const category: Category = await client.categories.get('4');
    console.log(`Get category (id=4} created at ${category.date_add}`);

    expect(category.id).not.toBeNull();
  });

  it('Add a category', async () => {
    const client = new WsClient(
      testConfig.get('config').url,
      testConfig.get('config').key,
    );
    const category: Category = await client.categories.create(newCategory);
    console.log(
      `New category (id=${category.id} created at ${category.date_add}`,
    );

    expect(category.id).not.toBeNull();
  });

  it('Update a category', async () => {
    const client = new WsClient(
      testConfig.get('config').url,
      testConfig.get('config').key,
    );
    const category: Category = await client.categories.update(
      categoryMultilanguage,
    );
    console.log(`Category (id=4} updated at ${category.date_upd}`);

    expect(category.id).not.toBeNull();
  });

  it('Delete a category', async () => {
    const client = new WsClient(
      testConfig.get('config').url,
      testConfig.get('config').key,
    );
    const status = await client.categories.delete('12');
    console.log(`Category (id=12} deleted. Api response ${status}`);
    expect(status).toEqual(200);
  });
});
