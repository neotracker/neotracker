// tslint:disable-next-line match-default-export-name
import GithubAPI from '@octokit/rest';
import { authenticate, AuthenticateOptions } from './authenticate';
import { utils } from './utils';

export interface GithubOptions {
  readonly api?: GithubAPI.Options;
  readonly authenticate: AuthenticateOptions;
}

type PartialAuthenticateOptions = Omit<AuthenticateOptions, 'appID' | 'privateKey'>;
export interface NewGithubOptions {
  readonly api?: GithubAPI.Options;
  readonly authenticate: PartialAuthenticateOptions;
}

type Authenticate = (options: NewGithubOptions) => Promise<Github>;
export interface Github {
  readonly api: GithubAPI;
  readonly utils: ReturnType<typeof utils>;
  readonly authenticate: Authenticate;
}

export async function createGithub({
  api: apiOptions,
  authenticate: authenticateOptions,
}: GithubOptions): Promise<Github> {
  const api = new GithubAPI(apiOptions);
  await authenticate({ api, options: authenticateOptions });

  return {
    api,
    authenticate: async (newOptions) =>
      createGithub({
        api: newOptions.api,
        authenticate: {
          ...authenticateOptions,
          ...newOptions.authenticate,
        },
      }),
    utils: utils(api),
  };
}
