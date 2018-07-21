// tslint:disable no-shadowed-variable
import { ProcessorOptions, ProcessorResult } from './types';

export enum MessageType {
  Init = 'Init',
  Files = 'Files',
  UpdateFile = 'UpdateFile',
  RemoveFile = 'RemoveFile',
}

export interface RequestBase {
  readonly seq: number;
}

export type Request = Init.Request | UpdateFile.Request | RemoveFile.Request | Files.Request;

export type Response = Init.Response | UpdateFile.Response | RemoveFile.Response | Files.Response;

export interface ResponseBase<T = undefined> {
  readonly seq: number;
  readonly payload: T;
  readonly error?: Error;
}

export interface Diagnostic {}

export namespace Init {
  export interface Payload {
    readonly options: ProcessorOptions;
  }

  export interface Request extends RequestBase {
    readonly type: MessageType.Init;
    readonly payload: Payload;
  }

  export interface Response extends ResponseBase {
    readonly type: MessageType.Init;
  }
}

export namespace UpdateFile {
  export interface Payload {
    readonly fileName: string;
    readonly text: string;
    readonly ifExist: boolean;
  }

  export interface Request extends RequestBase {
    readonly type: MessageType.UpdateFile;
    readonly payload: Payload;
  }

  export interface Response extends ResponseBase<ProcessorResult> {
    readonly type: MessageType.UpdateFile;
  }
}

export namespace RemoveFile {
  export interface Payload {
    readonly fileName: string;
  }

  export interface Request extends RequestBase {
    readonly type: MessageType.RemoveFile;
    readonly payload: Payload;
  }

  export interface Response extends ResponseBase<ProcessorResult> {
    readonly type: MessageType.RemoveFile;
  }
}

export namespace Files {
  export interface Request extends RequestBase {
    readonly type: MessageType.Files;
  }

  export interface Response
    extends ResponseBase<{
        readonly files: ReadonlyArray<string>;
      }> {
    readonly type: MessageType.Files;
  }
}
