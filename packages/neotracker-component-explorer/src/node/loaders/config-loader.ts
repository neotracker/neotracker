// @ts-ignore
import { generate } from 'escodegen';
import * as path from 'path';
// @ts-ignore
import toAst from 'to-ast';
import webpack from 'webpack';
import { ExplorerConfig } from '../../types';
import { ConfigLoaderRenderConfig, Require } from './types';
import { createLoaderRequire, createRequireDefault, getExplorerConfig, getGlobFiles } from './utils';

const markdownLoader = path.resolve(__dirname, '../entry/markdown-loader.js');
const typescriptLoader = path.resolve(__dirname, '../entry/typescript-loader.js');

export function configLoader() {
  // do nothing
}

export namespace configLoader {
  export function pitch() {
    try {
      // @ts-ignore
      compile(this);
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error(e, e.stack);
      throw e;
    }
  }
}

const compile = (loader: webpack.loader.LoaderContext): void => {
  const callback = loader.async();
  if (callback) {
    getSource(loader, getExplorerConfig(loader))
      .then((result) => callback(undefined, result))
      .catch(callback);
  }
};

const getSource = async (loader: webpack.loader.LoaderContext, config: ExplorerConfig): Promise<string> => {
  const renderConfig = await getRenderConfig(config);

  loader.addContextDependency(config.componentsDir);

  return `
if (module.hot) {
  module.hot.accept([]);
}

module.exports = ${generate(toAst(renderConfig))}
`;
};

const getRenderConfig = async (config: ExplorerConfig): Promise<ConfigLoaderRenderConfig> => {
  const [markdown, typescript] = await Promise.all([
    getRequires({ config, ext: 'md', loaderPath: markdownLoader }),
    getRequires({ config, ext: 'tsx', loaderPath: typescriptLoader }),
  ]);

  return {
    meta: config.meta,
    editorConfig: config.editorConfig,
    markdown,
    typescript,
    proxies: config.proxies.browser === undefined ? [] : createRequireDefault(config.proxies.browser),
  };
};

const getRequires = async ({
  config,
  ext,
  loaderPath,
}: {
  readonly config: ExplorerConfig;
  readonly ext: string;
  readonly loaderPath: string;
}): Promise<ReadonlyArray<Require>> => {
  const files = await getGlobFiles({ rootDir: config.configDir, componentsDir: config.componentsDir, ext });

  return files.map((filePath) => createLoaderRequire({ loaderPath, filePath }));
};
