import { expect } from '@jest/globals';
import { describe, it } from 'node:test';
import { Category } from 'prestashop-ws-client';
import { WSClient } from 'prestashop-ws-client/src/ws-client';
import {
  categoryMultilanguage,
  newCategory,
} from './fixtures/categories-sample';
import { testConfig } from './test.config';

describe('WS client: create', () => {
  it('Get a category', async () => {
    const client: WSClient = new WSClient(
      testConfig.get('config').url,
      testConfig.get('config').key,
    );
    const category: Category = await client.categories.get('4');
    console.log(`Get category (id=4} created at ${category.date_add}`);

    expect(category.id).not.toBeNull();
  });

  it('Add a category', async () => {
    const client = new WSClient(
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
    const client: WSClient = new WSClient(
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
    const client: WSClient = new WSClient(
      testConfig.get('config').url,
      testConfig.get('config').key,
    );
    const status = await client.categories.delete('12');
    console.log(`Category (id=12} deleted. Api response ${status}`);
    expect(status).toEqual(200);
  });
});
