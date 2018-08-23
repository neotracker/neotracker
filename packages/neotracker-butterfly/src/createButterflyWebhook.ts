import { CircleCIOptions, createCircleCI } from './circleci';
import { ButterflyOptions, createButterfly } from './createButterfly';
import { createGithub, GithubOptions } from './github';
import { ButterflyWebhook, Logger } from './types';

const DEFAULT_LOGGER: Logger = {
  verbose: (message) => {
    // tslint:disable-next-line no-console
    console.log(message);
  },
  info: (message) => {
    // tslint:disable-next-line no-console
    console.log(message);
  },
  error: (message, error) => {
    // tslint:disable-next-line no-console
    console.error(message);
    if (error !== undefined) {
      // tslint:disable-next-line no-console
      console.error(error);
    }
  },
};
export interface ButterflyWebhookOptions extends ButterflyOptions {
  readonly circleci: CircleCIOptions;
  readonly github: GithubOptions;
}

export const createButterflyWebhook = async ({
  circleci: circleciOptions,
  github: githubOptions,
  log = DEFAULT_LOGGER,
}: ButterflyWebhookOptions): Promise<ButterflyWebhook> => {
  const [butterfly, github, circleci] = await Promise.all([
    createButterfly({ log }),
    createGithub(githubOptions),
    createCircleCI(circleciOptions),
  ]);

  return {
    circleci,
    github,
    ...butterfly,
  };
};
