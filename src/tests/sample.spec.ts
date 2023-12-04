import { describe, it } from 'node:test';
import { Endpoint } from '../endpoint.enum';
import { Config } from '../types/config.type';
import { WSClient } from '../ws-client';

describe('WS client create', () => {
  it('Add new category', async () => {
    const config: Config = {
      url: 'http://localhost:8000',
      wsKey: 'GENERATE_A_COMPLEX_VALUE_WITH_32',
    };

    const wsClientP = new WSClient(Endpoint.products, config);
    // const synopsys: Category = await wsClient.getSynopsis();
    // const blank = wsClient.getBlank();
    // newCategory;
    const keys = wsClientP.traverseTree(await wsClientP.getBlank());

    console.log(keys);
    //
    // const wsClient = new WSClient(Endpoint.categories, config);
    // // // The type of newCategory is CategoryWritable
    // const category: Category = await wsClient.create(newCategory);
    //
    // console.log(
    //   `New category (id=${category.id} created at ${category.date_add}`,
    // );
    // expect(category.id).not.toBeNull();
  });
});
