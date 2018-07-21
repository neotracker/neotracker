// @ts-ignore
import astTypes from 'ast-types';
import { generate } from 'escodegen';
import * as path from 'path';
// @ts-ignore
import toAst from 'to-ast';
import webpack from 'webpack';
import { ExplorerConfig, LoaderTypescriptConfig } from '../../types';
import { toUnix } from '../component';
import { ensureInstance } from './instance';
import { Require } from './types';
import { createRequire, getExplorerConfig, getRequires } from './utils';

const b = astTypes.builders;

// tslint:disable-next-line readonly-array
const absolutize = (fileName: string) => path.resolve(__dirname, '..', '..', 'browser', fileName);

// tslint:disable-next-line export-name
export function typescriptLoader(source: string) {
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
  const typescript = await getTypescriptConfig(loader, config, source);
  const allCode = typescript.examples.map((example) => example.code).join('\n');
  const requiresFromExamples = getRequires(allCode);
  const allRequiresCode = requiresFromExamples.concat(['React']).reduce<{ [key: string]: Require }>(
    (acc, requireRequest) => ({
      ...acc,
      [requireRequest]: createRequire(requireRequest),
    }),
    {},
  );

  return `
if (module.hot) {
  module.hot.accept([]);
}

var requireMap = ${generate(toAst(allRequiresCode))};
var requireInRuntimeBase = require(${JSON.stringify(absolutize('requireInRuntime'))});
var requireInRuntime = requireInRuntimeBase.bind(null, requireMap);
var evalInContextBase = require(${JSON.stringify(absolutize('evalInContext'))});
var evalInContext = evalInContextBase.bind(null, '', requireInRuntime);

module.exports = ${generate(toAst(typescript))};
`;
};

type TypescriptConfig = Omit<LoaderTypescriptConfig, 'evalInContext'> & {
  readonly evalInContext: {
    // tslint:disable-next-line no-any
    readonly toAST: () => any;
  };
};

const getTypescriptConfig = async (
  loader: webpack.loader.LoaderContext,
  config: ExplorerConfig,
  source: string,
): Promise<TypescriptConfig> => {
  const mutableInstance = await ensureInstance(loader, config, 'typescript-loader');
  const filePath = toUnix(loader.resourcePath);
  mutableInstance.mutableCompiledFiles[filePath] = true;

  const result = await mutableInstance.processor.updateFile(filePath, source);
  result.dependencies.forEach((dep) => loader.addDependency(path.normalize(dep)));
  result.errors.forEach((error) => {
    // tslint:disable-next-line no-console
    console.error(error);
  });

  return {
    filePath: toUnix(path.relative(config.configDir, loader.resourcePath)),
    absoluteFilePath: filePath,
    components: result.components,
    examples: result.examples,
    evalInContext: {
      toAST: () => b.identifier('evalInContext'),
    },
  };
};
