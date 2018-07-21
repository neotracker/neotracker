import * as childProcess from 'child_process';
import * as path from 'path';
import { run, RunProcess } from './createProcessor';
import { createQueuedSender, QueuedSender } from './send';

import { Files, MessageType, RemoveFile, Request, Response, UpdateFile } from './protocol';
import { ProcessorOptions } from './types';

interface Resolver<T> {
  readonly resolve: (value: T) => void;
  readonly reject: (error: Error) => void;
}

export class Processor {
  private readonly checker: RunProcess;
  // tslint:disable-next-line no-any
  private readonly pending: Map<number, Resolver<any>> = new Map();
  private readonly sender: QueuedSender;
  private mutableSeq = 0;

  public constructor(options: ProcessorOptions, fork = false) {
    const execArgv = getExecArgv();
    const checker = fork
      ? childProcess.fork(path.join(__dirname, '..', '..', 'entry', 'component-processor.js'), [], { execArgv })
      : run();

    this.sender = fork ? createQueuedSender(checker) : { send: checker.send };

    this.checker = checker;

    checker.on('error', (e) => {
      // tslint:disable-next-line no-console
      console.error('Component processor error:', e);
    });

    checker.on('message', (res: Response) => {
      const { seq, payload, error } = res;
      const resolver = this.pending.get(seq);
      if (resolver) {
        if (error) {
          resolver.reject(error);
        } else {
          resolver.resolve(payload);
        }

        this.pending.delete(seq);
      } else {
        // tslint:disable-next-line no-console
        console.warn('Unknown message: ', payload);
      }
    });

    // tslint:disable-next-line no-floating-promises
    this.request({
      seq: this.getSeq(),
      type: MessageType.Init,
      payload: { options },
    });
  }

  public async request<T>(message: Request): Promise<T> {
    // tslint:disable-next-line promise-must-complete
    const promise = new Promise<T>((resolve, reject) => {
      const resolver: Resolver<T> = { resolve, reject };
      this.pending.set(message.seq, resolver);
    });
    this.sender.send(message);

    return promise;
  }

  public async updateFile(fileName: string, text: string, ifExist = false): Promise<UpdateFile.Response['payload']> {
    return this.request<UpdateFile.Response['payload']>({
      seq: this.getSeq(),
      type: MessageType.UpdateFile,
      payload: {
        fileName,
        text,
        ifExist,
      },
    });
  }

  public async removeFile(fileName: string): Promise<RemoveFile.Response['payload']> {
    return this.request<RemoveFile.Response['payload']>({
      seq: this.getSeq(),
      type: MessageType.RemoveFile,
      payload: {
        fileName,
      },
    });
  }

  public async getFiles(): Promise<Files.Response['payload']> {
    return this.request<Files.Response['payload']>({
      seq: this.getSeq(),
      type: MessageType.Files,
    });
  }

  public kill() {
    this.checker.kill('SIGKILL');
    [...this.pending.values()].forEach(({ reject }) => {
      reject(new Error('Killed'));
    });
  }

  private getSeq(): number {
    const seq = this.mutableSeq;
    this.mutableSeq += 1;

    return seq;
  }
}

function getExecArgv() {
  const mutableExecArgv = [];
  // tslint:disable-next-line no-loop-statement
  for (let _i = 0, _a = process.execArgv; _i < _a.length; _i += 1) {
    const arg = _a[_i];
    const match = /^--(debug|inspect)(=(\d+))?$/.exec(arg);
    if (match) {
      const currentPort =
        (match[3] as string | undefined) !== undefined ? +match[3] : match[1] === 'debug' ? 5858 : 9229;
      mutableExecArgv.push(`--${match[1]}=${currentPort + 1}`);
    } else {
      mutableExecArgv.push(arg);
    }
  }

  return mutableExecArgv;
}
