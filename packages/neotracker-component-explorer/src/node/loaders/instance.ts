import * as fs from 'fs-extra';
import _ from 'lodash';
import * as path from 'path';
import ts from 'typescript';
import webpack from 'webpack';
import { ExplorerConfig } from '../../types';
import { Processor, toUnix } from '../component';
import { getGlobFiles } from './utils';

export interface Instance {
  readonly id: number;
  // tslint:disable-next-line readonly-keyword
  mutableCompiledFiles: { [key: string]: boolean };
  readonly processor: Processor;
  readonly context: string;
  mutableTimes: MTimes;
  mutableWatchedFiles?: Set<string>;
  mutableStartTime?: number;
}

function getRootCompiler(compiler: webpack.Compiler): webpack.Compiler {
  // tslint:disable-next-line no-any
  if ((compiler as any).parentCompilation) {
    // tslint:disable-next-line no-any
    return getRootCompiler((compiler as any).parentCompilation.compiler);
  }

  return compiler;
}

function resolveInstance(compiler: webpack.Compiler, instanceName: string): Instance | undefined {
  // tslint:disable-next-line no-any
  const mutableCompiler = compiler as any;
  if (!mutableCompiler._tsInstances) {
    mutableCompiler._tsInstances = {};
  }

  return mutableCompiler._tsInstances[instanceName];
}

function setInstance(compiler: webpack.Compiler, instanceName: string, instance: Instance): void {
  // tslint:disable-next-line no-any
  const mutableCompiler = compiler as any;
  mutableCompiler._tsInstances[instanceName] = instance;
}

// tslint:disable-next-line no-let
let id = 0;
export async function ensureInstance(
  loader: webpack.loader.LoaderContext,
  config: ExplorerConfig,
  instanceName: string,
): Promise<Instance> {
  const rootCompiler = getRootCompiler(loader._compiler);
  const exInstance = resolveInstance(rootCompiler, instanceName);
  if (exInstance !== undefined) {
    return exInstance;
  }

  const context = process.cwd();
  const tsImpl = ts;

  const { options: compilerOptions } = readConfigFile(config, tsImpl);

  const compiler = loader._compiler;
  setupWatchRun(compiler, instanceName);
  setupAfterCompile(compiler, instanceName);

  const globFiles = await getGlobFiles({ rootDir: config.configDir, componentsDir: config.componentsDir, ext: 'tsx' });
  const processor = new Processor(
    {
      instanceName,
      rootDir: process.cwd(),
      compilerOptions,
      fileNames: globFiles,
    },
    true,
  );

  const instance: Instance = {
    id,
    mutableCompiledFiles: {},
    processor,
    context,
    mutableTimes: {},
  };
  id += 1;
  setInstance(compiler, instanceName, instance);

  return instance;
}

export function readConfigFile(config: ExplorerConfig, tsImpl: typeof ts): ts.ParsedCommandLine {
  const jsonConfigFile = tsImpl.readConfigFile(config.tsconfig, tsImpl.sys.readFile);

  return tsImpl.parseJsonConfigFileContent(
    jsonConfigFile.config,
    tsImpl.sys,
    path.dirname(config.tsconfig),
    {},
    config.tsconfig,
  );
}

const EXTENSIONS = /\.tsx?$|\.jsx?$/;
interface MTimes {
  // tslint:disable readonly-keyword
  [key: string]: number;
}

const filterMtimes = (mtimes: MTimes): MTimes => {
  const mutableResult: MTimes = {};
  Object.keys(mtimes).forEach((fileName) => {
    if (!!EXTENSIONS.test(fileName)) {
      mutableResult[fileName] = mtimes[fileName];
    }
  });

  return mutableResult;
};

function setupWatchRun(outerCompiler: webpack.Compiler, instanceName: string) {
  outerCompiler.hooks.watchRun.tapAsync('component-loader', (compiler, callback) => {
    const mutableInstance = resolveInstance(compiler, instanceName);
    if (mutableInstance === undefined) {
      return;
    }

    const processor = mutableInstance.processor;
    // tslint:disable-next-line no-any
    const watcher = (compiler as any).watchFileSystem.watcher || (compiler as any).watchFileSystem.wfs.watcher;

    // tslint:disable-next-line no-any
    const startTime = mutableInstance.mutableStartTime || (compiler as any).startTime;
    const times = filterMtimes(watcher.getTimes());
    const lastCompiled = mutableInstance.mutableCompiledFiles;

    mutableInstance.mutableCompiledFiles = {};
    mutableInstance.mutableStartTime = startTime;

    const set = new Set(Object.keys(times).map(toUnix));
    if (mutableInstance.mutableWatchedFiles === undefined || !_.isEmpty(lastCompiled)) {
      const checkFiles =
        mutableInstance.mutableWatchedFiles === undefined
          ? Object.keys(lastCompiled)
          : [...mutableInstance.mutableWatchedFiles];
      const removedFiles = checkFiles.filter((checkFile) => !set.has(checkFile));

      removedFiles.forEach((file) => {
        // tslint:disable-next-line no-floating-promises
        processor.removeFile(file);
      });
    }

    mutableInstance.mutableWatchedFiles = set;

    const instanceTimes = mutableInstance.mutableTimes;
    mutableInstance.mutableTimes = { ...times };

    const changedFiles = Object.keys(times).filter((fileName) => {
      const instanceTime =
        (instanceTimes[fileName] as number | undefined) === undefined ? startTime : instanceTimes[fileName];

      return times[fileName] > instanceTime;
    });

    const updates = changedFiles.map(async (fileName) => {
      const unixFileName = toUnix(fileName);
      const exists = await fs.pathExists(unixFileName);
      if (exists) {
        return processor.updateFile(unixFileName, fs.readFileSync(unixFileName).toString(), true);
      }

      return processor.removeFile(unixFileName);
    });

    Promise.all(updates)
      .then(() => {
        callback();
      })
      .catch(callback);
  });
}

function setupAfterCompile(compiler: webpack.Compiler, instanceName: string) {
  compiler.hooks.afterCompile.tapPromise('typescript-loader', async (compilation) => {
    // tslint:disable-next-line no-any
    if (!(compilation.compiler as any).isChild()) {
      const instance = resolveInstance(compilation.compiler, instanceName);
      if (instance !== undefined) {
        await instance.processor.getFiles().then(({ files }) => {
          // tslint:disable-next-line
          Array.prototype.push.apply((compilation as any).fileDependencies, files.map(path.normalize));
        });
      }
    }
  });
}
