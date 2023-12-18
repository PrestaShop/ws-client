import { describe, it } from 'node:test';
import { Endpoint } from '../endpoint.enum';
import { WSClient, WsConfig } from '../ws-client';

describe('WS client: delete', () => {
  it('Delete a category', async () => {
    const config: WsConfig = {
      url: 'http://localhost:8000',
      wsKey: 'GENERATE_A_COMPLEX_VALUE_WITH_32',
    };
    const wsClient = new WSClient(Endpoint.categories, config);
    const status = await wsClient.delete('12');
    console.log(`Delete category (id=12} deleted. Api response ${status}`);
    expect(status).toEqual(200);
  });
});
