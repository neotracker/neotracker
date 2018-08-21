import execa from 'execa';
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

export const createButterfly = async ({ log = DEFAULT_LOGGER }: ButterflyOptions): Promise<Butterfly> => ({
  exec: (file, argsOrOptions, optionsIn) => {
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

    proc.stdout.on('data', (value) => {
      log.verbose(value instanceof Buffer ? value.toString('utf8') : value);
    });
    proc.stderr.on('data', (value) => {
      log.error(value instanceof Buffer ? value.toString('utf8') : value);
    });

    return proc;
  },
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
});
