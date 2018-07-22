import { github, GithubOptions } from './github';

export interface HooksOptions {
  readonly github: GithubOptions;
}

// tslint:disable-next-line export-name
export const hooks = (options: HooksOptions) => ({
  github: github(options.github),
});
