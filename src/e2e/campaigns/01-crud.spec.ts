import { describe, it } from 'node:test';
import { Category } from '../../types/ws-entities/categories.type';
import { categories } from '../../ws-client-endpoints';
import { init } from '../../ws-config';
import { categoryMultilanguage, newCategory } from '../categories-sample';
import { testConfig } from '../test.config';

describe('WS client: create', () => {
  it('Get a category', async () => {
    init(testConfig.get('config').url, testConfig.get('config').key);
    const category: Category = await categories.get('4');
    console.log(`Get category (id=4} created at ${category.date_add}`);

    expect(category.id).not.toBeNull();
  });

  it('Add a category', async () => {
    init(testConfig.get('config').url, testConfig.get('config').key);
    const category: Category = await categories.create(newCategory);
    console.log(
      `New category (id=${category.id} created at ${category.date_add}`,
    );

    expect(category.id).not.toBeNull();
  });

  it('Update a category', async () => {
    init(testConfig.get('config').url, testConfig.get('config').key);
    const category: Category = await categories.update(categoryMultilanguage);
    console.log(`Category (id=4} updated at ${category.date_upd}`);

    expect(category.id).not.toBeNull();
  });

  it('Delete a category', async () => {
    init(testConfig.get('config').url, testConfig.get('config').key);
    const status = await categories.delete('12');
    console.log(`Category (id=12} deleted. Api response ${status}`);
    expect(status).toEqual(200);
  });
});
