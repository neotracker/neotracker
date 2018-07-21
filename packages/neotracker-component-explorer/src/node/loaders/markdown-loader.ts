import { generate } from 'escodegen';
import * as path from 'path';
// @ts-ignore
import toAst from 'to-ast';
import webpack from 'webpack';
import { ExplorerConfig, LoaderMarkdownConfig } from '../../types';
import { toUnix } from '../component';
import { getExplorerConfig } from './utils';

// tslint:disable-next-line export-name
export function markdownLoader(source: string) {
  try {
    // @ts-ignore
    compile(this, source);
  } catch (e) {
    // tslint:disable-next-line no-console
    console.error(e, e.stack);
    throw e;
  }
}

const compile = (loader: webpack.loader.LoaderContext, source: string): void => {
  const callback = loader.async();
  if (callback) {
    getSource(loader, getExplorerConfig(loader), source)
      .then((result) => callback(undefined, result))
      .catch(callback);
  }
};

const getSource = async (
  loader: webpack.loader.LoaderContext,
  config: ExplorerConfig,
  source: string,
): Promise<string> => {
  const markdown = await getMarkdownConfig(loader, config, source);

  return `
if (module.hot) {
  module.hot.accept([]);
}

module.exports = ${generate(toAst(markdown))};
`;
};

const getMarkdownConfig = async (
  loader: webpack.loader.LoaderContext,
  config: ExplorerConfig,
  source: string,
): Promise<LoaderMarkdownConfig> => {
  const filePath = toUnix(path.relative(config.configDir, loader.resourcePath));

  return {
    filePath,
    content: source,
  };
};
