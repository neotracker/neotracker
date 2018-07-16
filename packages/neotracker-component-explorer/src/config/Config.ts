import { Proxy } from '../types';

export interface Config {
  readonly proxies: ReadonlyArray<Proxy>;
}
