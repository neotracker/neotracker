import { URL } from 'url';
import { ButterflyCIHandler, Check } from './ButterflyCIHandler';
import { ButterflyLocalHandler } from './ButterflyLocalHandler';

export interface CreateButterflyCircleCIHandlerOptions {
  readonly checks: ReadonlyArray<Check>;
}
const hasCiEnvVars = (): boolean => {
  if (
    process.env.BUTTERFLY_GITHUB_APP_ID !== undefined &&
    process.env.BUTTERFLY_CIRCLE_TOKEN !== undefined &&
    process.env.BUTTERFLY_GITHUB_PRIVATE_KEY !== undefined &&
    process.env.CIRCLE_BRANCH !== undefined &&
    process.env.CIRCLE_SHA1 !== undefined &&
    process.env.CIRCLE_PULL_REQUEST !== undefined &&
    process.env.CIRCLE_PROJECT_USERNAME !== undefined &&
    process.env.CIRCLE_PROJECT_REPONAME !== undefined
  ) {
    return true;
  }

  return false;
};

export const createButterflyHandler = (options: CreateButterflyCircleCIHandlerOptions) =>
  hasCiEnvVars()
    ? new ButterflyCIHandler({
        ...options,
        circleci: {
          circleci: {
            token: getEnv('BUTTERFLY_CIRCLE_TOKEN'),
          },
        },
        github: {
          authenticate: {
            appID: parseInt(getEnv('BUTTERFLY_GITHUB_APP_ID'), 10),
            privateKey: Buffer.from(getEnv('BUTTERFLY_GITHUB_PRIVATE_KEY'), 'base64').toString('utf8'),
          },
        },
        commit: {
          branch: getEnv('CIRCLE_BRANCH'),
          sha: getEnv('CIRCLE_SHA1'),
        },
        pullRequest: {
          issueNumber: extractIssueNumber(getEnv('CIRCLE_PULL_REQUEST')),
          owner: getEnv('CIRCLE_PROJECT_USERNAME'),
          repo: getEnv('CIRCLE_PROJECT_REPONAME'),
        },
      })
    : new ButterflyLocalHandler(options);

// Something like https://github.com/neotracker/neotracker-internal/pull/336
const extractIssueNumber = (urlString: string): number => {
  const url = new URL(urlString);

  return parseInt(url.pathname.slice(1).split('/')[3], 10);
};

const getEnv = (variable: string): string => {
  const value = process.env[variable];
  if (value === undefined) {
    throw new Error(`Missing CircleCI environment variable ${variable}.`);
  }

  return value;
};
