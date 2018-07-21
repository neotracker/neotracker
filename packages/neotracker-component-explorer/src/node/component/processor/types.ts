import ts from 'typescript';
import { Result as ProcessFileResult } from '../processFile';

export interface ProcessorOptions {
  readonly instanceName: string;
  readonly rootDir: string;
  readonly fileNames: ReadonlyArray<string>;
  readonly compilerOptions: ts.CompilerOptions;
}

export interface ProcessorResult extends ProcessFileResult {
  readonly dependencies: ReadonlyArray<string>;
}
