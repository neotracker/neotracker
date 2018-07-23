import { URL } from 'url';
import { ButterflyCIHandler, Check } from './ButterflyCIHandler';

export interface CreateButterflyCircleCIHandlerOptions {
  readonly checks: ReadonlyArray<Check>;
}

export const createButterflyCircleCIHandler = (options: CreateButterflyCircleCIHandlerOptions) =>
  new ButterflyCIHandler({
    ...options,
    circleci: {
      circleci: {
        token: getEnv('BUTTERFLY_CIRCLE_TOKEN'),
      },
    },
    github: {
      authenticate: {
        appID: parseInt(getEnv('BUTTERFLY_GITHUB_APP_ID'), 10),
        privateKey: getEnv('BUTTERFLY_GITHUB_PRIVATE_KEY'),
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
  });

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
