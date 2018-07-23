import { CircleCIOptions, createCircleCI } from './circleci';
import { createGithub, GithubOptions } from './github';
import { Butterfly, Logger } from './types';

export interface ButterflyOptions {
  readonly circleci: CircleCIOptions;
  readonly github: GithubOptions;
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

export const createButterfly = async ({
  circleci: circleciOptions,
  github: githubOptions,
  log = DEFAULT_LOGGER,
}: ButterflyOptions): Promise<Butterfly> => {
  const [circleci, github] = await Promise.all([createCircleCI(circleciOptions), createGithub(githubOptions)]);

  return {
    circleci,
    github,
    log,
  };
};
