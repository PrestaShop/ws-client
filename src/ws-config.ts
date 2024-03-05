import { Config } from './types/config.type';

export const wsConfig: Config = { url: '', key: '' };

export const init = (url: string, wsKey: string) => {
  wsConfig.url = url;
  wsConfig.key = wsKey;
};
