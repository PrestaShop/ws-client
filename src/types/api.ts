export type ApiParams = {
  method: string;
  path: string;
  params?: Record<string, unknown>;
  headers?: Headers;
  body?: unknown;
};
