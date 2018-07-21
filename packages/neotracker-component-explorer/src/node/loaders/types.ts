import { LoaderRenderConfig, Proxy } from '../../types';

export interface Require {
  readonly filePath: string;
  // tslint:disable-next-line no-any
  readonly toAST: () => any;
}
export type ConfigLoaderRenderConfig = Omit<LoaderRenderConfig, 'typescript' | 'markdown' | 'proxies'> & {
  readonly typescript: ReadonlyArray<Require>;
  readonly markdown: ReadonlyArray<Require>;
  readonly proxies: ReadonlyArray<Proxy> | Require;
};
