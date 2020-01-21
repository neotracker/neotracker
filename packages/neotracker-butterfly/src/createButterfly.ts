import * as appRootDir from 'app-root-dir';
import execa from 'execa';
import * as fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import { Butterfly, Logger } from './types';
export interface ButterflyOptions {
  readonly log?: Logger;
}

const DEFAULT_LOGGER: Logger = {
  verbose: () => {
    // do nothing
  },
  info: () => {
    // do nothing
  },
  error: () => {
    // do nothing
  },
};

const walk = async (rootDir: string, maxDepth = -1, curDepth = 0): Promise<ReadonlyArray<string>> => {
  const rdResp = await fs.readdir(rootDir);

  const keepDigging = !(maxDepth >= 0 && curDepth > maxDepth);

  const result = await Promise.all(
    rdResp.map(
      async (file): Promise<ReadonlyArray<string>> => {
        const curPath = path.join(rootDir, file);
        const fileStats = await fs.stat(curPath);
        if (fileStats.isDirectory() && keepDigging) {
          return walk(curPath, maxDepth, curDepth + 1);
        }
        if (fileStats.isFile()) {
          return [curPath];
        }

        return [];
      },
    ),
  );

  return result.reduce((arrOut, arrIn) => [...arrOut, ...arrIn], []);
};

const defaultRootPath = appRootDir.get();

const getFiles = async (rootPath: string = defaultRootPath, maxDepth = -1): Promise<ReadonlyArray<string>> =>
  walk(rootPath, maxDepth);

export const createButterfly = async ({ log = DEFAULT_LOGGER }: ButterflyOptions): Promise<Butterfly> => {
  const exec = (file: string, argsOrOptions?: execa.Options | ReadonlyArray<string>, optionsIn?: execa.Options) => {
    let args: ReadonlyArray<string> = [];
    let options: execa.Options | undefined;
    if (argsOrOptions !== undefined) {
      if (Array.isArray(argsOrOptions)) {
        args = argsOrOptions;
        options = optionsIn;
      } else {
        options = argsOrOptions as execa.Options | undefined;
      }
    }

    log.verbose(`$ ${file} ${args.join(' ')}`);
    const proc = execa(file, args, {
      ...(options === undefined ? {} : options),
      reject: false,
    });

    if (proc.stdout !== null) {
      proc.stdout.on('data', (value) => {
        log.verbose(value instanceof Buffer ? value.toString('utf8') : value);
      });
    }
    if (proc.stderr !== null) {
      proc.stderr.on('data', (value) => {
        log.error(value instanceof Buffer ? value.toString('utf8') : value);
      });
    }

    return proc;
  };

  const git = {
    resetToHead: async (): Promise<void> => {
      await exec('git', ['reset', 'HEAD', '--hard']);
    },
    getChangedFiles: async (): Promise<ReadonlyArray<string>> => {
      const proc = await exec('git', ['status', '--porcelain']);

      return proc.stdout.split('\n').filter((line) => line.length > 0);
    },
  };

  const removeFiles = async (fileList: ReadonlyArray<string>): Promise<void> => {
    await Promise.all(fileList.map(async (file: string) => fs.remove(file)));
  };

  const util = {
    removeFiles,
    getFiles,
  };

  return {
    exec,
    tmp: {
      fileName: async () =>
        new Promise<string>((resolve, reject) =>
          tmp.tmpName((error: Error | undefined, filePath) => {
            if (error) {
              reject(error);
            } else {
              resolve(filePath);
            }
          }),
        ),
    },
    log,
    git,
    util,
  };
};
