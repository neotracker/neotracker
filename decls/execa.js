/* @flow */
declare module 'execa' {
  import type { ChildProcess } from 'child_process';
  import type { Readable } from 'stream';

  declare type PipeOption = string;

  declare export type ExecaOptions = {|
    cwd?: string,
    env?: Object,
    argv0?: string,
    stdio?: PipeOption | [PipeOption, PipeOption, PipeOption],
    stdin?: PipeOption,
    stdout?: PipeOption,
    stderr?: PipeOption,
    detached?: boolean,
    uid?: number,
    gid?: number,
    shell?: boolean | string,
    preferLocal?: boolean,
    localDir?: string,
    input?: string | Buffer | Readable,
    reject?: boolean,
    cleanup?: boolean,
    encoding?: string,
    maxBuffer?: number,
    killSignal?: string | number,
    windowsVerbatimArguments?: boolean,
    windowsHide?: boolean,
  |};
  declare export type ExecaResult = {|
    stdout: string,
    stderr: string,
    code: number,
    failed: boolean,
    killed: boolean,
    signal: ?string,
    cmd: string,
    timedOut: boolean,
  |};

  declare export type ExecaPromise<T> = ChildProcess & Promise<T>;

  declare export default {
    (file: string, args?: Array<string>, options?: ExecaOptions): ExecaPromise<ExecaResult>,
    stdout: (file: string, args?: Array<string>, options?: ExecaOptions) => ExecaPromise<string>,
    stderr: (file: string, args?: Array<string>, options?: ExecaOptions) => ExecaPromise<string>,
    shell: (command: string, options?: ExecaOptions) => ExecaPromise<ExecaResult>,
    sync: (file: string, args?: Array<string>, options?: ExecaOptions) => {| pid: number, output: Array<string>, stdout: string, stderr: string, status: number, signal: string, error: Error |},
  };
}
