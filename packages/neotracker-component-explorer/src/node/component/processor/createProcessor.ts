import * as crypto from 'crypto';
import * as path from 'path';
import ts from 'typescript';
import { assertNever } from '../../../shared/utils';
import { Context } from '../Context';
import { isCaseInsensitive, toUnix } from '../helpers';
import { processFile } from '../processFile';
import { CaseInsensitiveMap } from './fs';
import { Files, Init, MessageType, RemoveFile, Request, Response, UpdateFile } from './protocol';
import { ProcessorOptions, ProcessorResult } from './types';

interface File {
  // tslint:disable-next-line readonly-keyword
  fileName: string;
  // tslint:disable-next-line readonly-keyword
  text: string;
}

type WatchCallbacks<T> = Map<string, ReadonlyArray<T>>;
type WatchHost = ts.WatchCompilerHostOfFilesAndCompilerOptions<ts.SemanticDiagnosticsBuilderProgram> &
  ts.BuilderProgramHost;

export function createProcessor(receive: (cb: (msg: Request) => void) => void, send: (msg: Response) => void) {
  const caseInsensitive = isCaseInsensitive();
  let options: ProcessorOptions;
  const compiler = ts;
  const files = new CaseInsensitiveMap<File>();
  let rootFilesChanged = false;
  const log = {
    // tslint:disable-next-line no-console
    log: console.log.bind(console),
    // tslint:disable-next-line no-console
    error: console.error.bind(console),
  };
  const watchedFiles = new Map<string, ReadonlyArray<ts.FileWatcherCallback>>();
  const watchedDirectories = new Map<string, ReadonlyArray<ts.DirectoryWatcherCallback>>();
  const watchedDirectoriesRecursive = new Map<string, ReadonlyArray<ts.DirectoryWatcherCallback>>();
  const useCaseSensitiveFileNames = () => !caseInsensitive;
  const getCanonicalFileName = caseInsensitive
    ? (fileName: string) => fileName.toLowerCase()
    : (fileName: string) => fileName;

  let watch: ts.WatchOfFilesAndCompilerOptions<ts.SemanticDiagnosticsBuilderProgram>;

  function createWatchHost(): WatchHost {
    return {
      rootFiles: getRootFiles(),
      options: options.compilerOptions,
      useCaseSensitiveFileNames,
      getNewLine: () => compiler.sys.newLine,
      getCurrentDirectory: () => options.rootDir,
      getDefaultLibFileName,
      fileExists: (...args) => compiler.sys.fileExists.apply(compiler.sys, args),
      readFile,
      directoryExists: (...args) => compiler.sys.directoryExists.apply(compiler.sys, args),
      getDirectories: (...args) => compiler.sys.getDirectories.apply(compiler.sys, args),
      readDirectory: (...args) => compiler.sys.readDirectory.apply(compiler.sys, args),
      realpath: (...args) => compiler.sys.resolvePath.apply(compiler.sys, args),
      watchFile,
      watchDirectory,
      createProgram: compiler.createSemanticDiagnosticsBuilderProgram,
      createHash: (data: string) =>
        crypto
          .createHash('MD5')
          .update(data)
          .digest()
          .toString('hex'),
    };

    function readFile(fileName: string) {
      ensureFile(fileName);
      const file = files.get(fileName);

      return file === undefined ? undefined : file.text;
    }
  }

  function createWatch(): ts.WatchOfFilesAndCompilerOptions<ts.SemanticDiagnosticsBuilderProgram> {
    const watchHost = createWatchHost();

    return compiler.createWatchProgram(watchHost);
  }

  function getProgram(): ts.SemanticDiagnosticsBuilderProgram {
    if (rootFilesChanged) {
      rootFilesChanged = false;
      watch.updateRootFileNames(getRootFiles());
    }

    return watch.getProgram();
  }

  function getRootFiles() {
    return [...files.values()].map((file) => file.fileName);
  }

  function getDefaultLibFileName(compilerOptions: ts.CompilerOptions) {
    return toUnix(
      path.join(path.dirname(compiler.sys.getExecutingFilePath()), compiler.getDefaultLibFileName(compilerOptions)),
    );
  }

  function invokeWatcherCallbacks(
    callbacks: ReadonlyArray<ts.FileWatcherCallback> | undefined,
    fileName: string,
    eventKind: ts.FileWatcherEventKind,
  ): void;
  function invokeWatcherCallbacks(
    callbacks: ReadonlyArray<ts.DirectoryWatcherCallback> | undefined,
    fileName: string,
  ): void;
  function invokeWatcherCallbacks(
    callbacks: ReadonlyArray<ts.FileWatcherCallback> | ReadonlyArray<ts.DirectoryWatcherCallback> | undefined,
    fileName: string,
    eventKind?: ts.FileWatcherEventKind,
  ) {
    if (callbacks) {
      // The array copy is made to ensure that even if one of the callback removes the callbacks,
      // we dont miss any callbacks following it
      const cbs = callbacks.slice();
      cbs.forEach((cb) => {
        // tslint:disable-next-line no-any
        cb(fileName, eventKind as any);
      });
    }
  }

  function invokeFileWatcher(fileNameIn: string, eventKind: ts.FileWatcherEventKind) {
    const fileName = getCanonicalFileName(fileNameIn);

    invokeWatcherCallbacks(watchedFiles.get(fileName), fileName, eventKind);
  }

  function invokeDirectoryWatcher(directoryIn: string, fileAddedOrRemoved: string) {
    const directory = getCanonicalFileName(directoryIn);

    invokeWatcherCallbacks(watchedDirectories.get(directory), fileAddedOrRemoved);
    invokeRecursiveDirectoryWatcher(directory, fileAddedOrRemoved);
  }

  function invokeRecursiveDirectoryWatcher(directory: string, fileAddedOrRemoved: string) {
    invokeWatcherCallbacks(watchedDirectoriesRecursive.get(directory), fileAddedOrRemoved);
    const basePath = path.dirname(directory);
    if (directory !== basePath) {
      invokeRecursiveDirectoryWatcher(basePath, fileAddedOrRemoved);
    }
  }

  function createWatcher<T>(fileIn: string, callbacks: WatchCallbacks<T>, callback: T): ts.FileWatcher {
    const file = getCanonicalFileName(fileIn);
    const existing = callbacks.get(file);
    if (existing) {
      callbacks.set(file, existing.concat([callback]));
    } else {
      callbacks.set(file, [callback]);
    }

    return {
      close: () => {
        const currentExisting = callbacks.get(file);
        if (currentExisting) {
          callbacks.set(file, currentExisting.filter((value) => value !== callback));
        }
      },
    };
  }

  function watchFile(fileName: string, callback: ts.FileWatcherCallback, _pollingInterval?: number) {
    return createWatcher(fileName, watchedFiles, callback);
  }

  function watchDirectory(fileName: string, callback: ts.DirectoryWatcherCallback, recursive?: boolean) {
    return createWatcher(fileName, recursive ? watchedDirectoriesRecursive : watchedDirectories, callback);
  }

  function onFileCreated(fileName: string) {
    rootFilesChanged = true;

    invokeFileWatcher(fileName, compiler.FileWatcherEventKind.Created);
    invokeDirectoryWatcher(path.dirname(fileName), fileName);
  }

  function onFileRemoved(fileName: string) {
    rootFilesChanged = true;

    invokeFileWatcher(fileName, compiler.FileWatcherEventKind.Deleted);
    invokeDirectoryWatcher(path.dirname(fileName), fileName);
  }

  function onFileChanged(fileName: string) {
    invokeFileWatcher(fileName, compiler.FileWatcherEventKind.Changed);
  }

  function ensureFile(fileName: string) {
    const file = files.get(fileName);
    if (!file) {
      const text = compiler.sys.readFile(fileName);
      if (text) {
        files.set(fileName, {
          fileName,
          text,
        });
        onFileCreated(fileName);
      }
    } else if (file.fileName !== fileName) {
      if (caseInsensitive) {
        // tslint:disable-next-line no-object-mutation
        file.fileName = fileName; // use most recent name for case-sensitive file systems
        onFileChanged(fileName);
      } else {
        removeFile(file.fileName);

        const text = compiler.sys.readFile(fileName);
        if (text) {
          files.set(fileName, {
            fileName,
            text,
          });
          onFileCreated(fileName);
        }
      }
    }
  }

  function processInit({ seq, payload, type }: Init.Request) {
    options = payload.options;
    options.fileNames.forEach(ensureFile);
    watch = createWatch();

    send({ seq, type, payload: undefined });
  }

  function updateFile(fileName: string, text: string, ifExist = false) {
    const file = files.get(fileName);
    if (file) {
      let updated = false;
      if (file.fileName !== fileName) {
        if (caseInsensitive) {
          // tslint:disable-next-line no-object-mutation
          file.fileName = fileName; // use most recent name for case-sensitive file systems
        } else {
          removeFile(file.fileName);

          files.set(fileName, {
            fileName,
            text,
          });
          onFileCreated(fileName);
        }
      }
      if (file.text !== text) {
        updated = true;
      }
      if (!updated) {
        return;
      }
      // tslint:disable-next-line no-object-mutation
      file.text = text;
      onFileChanged(fileName);
    } else if (!ifExist) {
      files.set(fileName, {
        fileName,
        text,
      });
      onFileCreated(fileName);
    }
  }

  function removeFile(fileName: string) {
    if (files.has(fileName)) {
      files.delete(fileName);
      onFileRemoved(fileName);
    }
  }

  const resultCache = new Map<string, ProcessorResult>();

  function processFileCached(filePath: string, force = false): ProcessorResult {
    let result = resultCache.get(filePath);
    if (result === undefined || force) {
      const program = getProgram();
      const processFileResult = processFile({
        context: new Context({ program: program.getProgram() }),
        filePath,
      });

      let dependencies: ReadonlyArray<string> = [];
      const sourceFile = program.getSourceFile(filePath);
      if (sourceFile && (processFileResult.components.length > 0 || processFileResult.examples.length > 0)) {
        dependencies = program.getAllDependencies(sourceFile);
      }

      result = {
        ...processFileResult,
        dependencies,
      };
    }

    resultCache.set(filePath, result);

    return result;
  }

  function processUpdate({ seq, payload, type }: UpdateFile.Request) {
    updateFile(payload.fileName, payload.text, payload.ifExist);
    const result = processFileCached(payload.fileName, true);

    send({ seq, type, payload: result });
  }

  function processRemove({ seq, type, payload }: RemoveFile.Request) {
    const result = processFileCached(payload.fileName);
    removeFile(payload.fileName);

    send({ seq, type, payload: result });
  }

  function processFiles({ seq, type }: Files.Request) {
    send({
      seq,
      type,
      payload: {
        files: getProgram()
          .getSourceFiles()
          .map((f) => f.fileName),
      },
    });
  }

  receive((req) => {
    try {
      switch (req.type) {
        case MessageType.Init:
          processInit(req);
          break;
        case MessageType.RemoveFile:
          processRemove(req);
          break;
        case MessageType.UpdateFile:
          processUpdate(req);
          break;
        case MessageType.Files:
          processFiles(req);
          break;
        default:
          assertNever(req);
      }
    } catch (error) {
      log.error(`Child process failed to process the request:`, error);
      // tslint:disable-next-line no-any
      send({ seq: req.seq, type: req.type, payload: error } as any);
    }
  });
}

// tslint:disable no-any
export interface RunProcess {
  readonly on: (type: string, cb: (result: any) => void) => void;
  readonly send: (msg: any, cb?: () => void) => void;
  readonly kill: (signal: string) => void;
}

export const run = (): RunProcess => {
  let send: RunProcess['send'] = () => {
    throw new Error('Not ready for messages');
  };
  let runReceive: (msg: any) => void = () => {
    // do nothing
  };

  createProcessor(
    (receive) => {
      send = (msg, cb) => {
        receive(msg);
        if (cb) {
          cb();
        }
      };
    },
    // tslint:disable-next-line no-unnecessary-callback-wrapper
    (msg) => runReceive(msg),
  );

  return {
    on: (type, cb) => {
      if (type === 'message') {
        runReceive = cb;
      }
    },
    send,
    kill: () => {
      // do nothing
    },
  };
};
// tslint:enable no-any
