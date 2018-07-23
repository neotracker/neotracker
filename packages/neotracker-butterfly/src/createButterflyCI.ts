import { ButterflyOptions, createButterfly } from './createButterfly';
import { ButterflyCI, Logger } from './types';

export interface ButterflyCIOptions extends ButterflyOptions {
  readonly pullRequest: {
    readonly issueNumber: number;
    readonly owner: string;
    readonly repo: string;
  };
}

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

export const createButterflyCI = async ({
  pullRequest,
  log = DEFAULT_LOGGER,
  ...rest
}: ButterflyCIOptions): Promise<ButterflyCI> => {
  const butterfly = await createButterfly({ ...rest, log });
  const pullRequestResponse = await butterfly.github.api.pullRequests.get({
    number: pullRequest.issueNumber,
    owner: pullRequest.owner,
    repo: pullRequest.repo,
  });

  return {
    ...butterfly,
    pr: pullRequestResponse.data,
  };
};
