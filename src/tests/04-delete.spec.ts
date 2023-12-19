import { describe, it } from 'node:test';
import { Endpoint } from '../endpoint.enum';
import { WSClient, WsConfig } from '../ws-client';
import { testConfig } from './test.config';

describe('WS client: delete', () => {
  it('Delete a category', async () => {
    const wsClient = new WSClient(
      Endpoint.categories,
      testConfig.get('config') as WsConfig,
    );
    const status = await wsClient.delete('12');
    console.log(`Delete category (id=12} deleted. Api response ${status}`);
    expect(status).toEqual(200);
  });
});
