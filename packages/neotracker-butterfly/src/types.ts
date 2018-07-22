import { circleci } from './circleci';
import { github } from './github';

export interface Butterfly {
  readonly circleci: typeof circleci;
  readonly github: typeof github;
}

// tslint:disable-next-line no-any
export interface GithubEvent<TPayload = any> {
  readonly name: string;
  readonly payload: TPayload;
}
