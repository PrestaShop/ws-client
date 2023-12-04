import { Config } from '../types/config.type';

export const config: Config = { url: '', wsKey: '' };

export const initConfig = (url: string, wsKey: string) => {
  config.url = url;
  config.wsKey = wsKey;
};
