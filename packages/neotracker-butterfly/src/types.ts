import { createCircleCI } from './circleci';
import { createGithub } from './github';

// tslint:disable-next-line no-any no-unused readonly-array
type PromiseReturnType<T> = T extends (...args: any[]) => Promise<infer R> ? R : never;

export interface Logger {
  readonly verbose: (message: string) => void;
  readonly info: (message: string) => void;
  readonly error: (message: string, error?: Error) => void;
}

export interface Butterfly {
  readonly circleci: PromiseReturnType<typeof createCircleCI>;
  readonly github: PromiseReturnType<typeof createGithub>;
  readonly log: Logger;
}

// tslint:disable-next-line no-any
export interface GithubEvent<TPayload = any> {
  readonly name: string;
  readonly payload: TPayload;
}
