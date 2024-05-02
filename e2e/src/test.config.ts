import { Config } from 'dist/src/types/index.js';

const wsConfig: Config = {
  url: 'http://localhost:8000',
  key: 'GENERATE_A_COMPLEX_VALUE_WITH_32',
};

export const testConfig = {
  get: (key: string): any => {
    if (key === 'config') return wsConfig;
    throw new Error(`Missing test configuration for ${key}`);
  },
};
