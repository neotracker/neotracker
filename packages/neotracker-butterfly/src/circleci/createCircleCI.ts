import { CircleCI as CircleCIAPI, CircleCIOptions as CircleCIAPIOptions } from './CircleCI';
import { utils } from './utils';

export interface CircleCIOptions {
  readonly circleci: CircleCIAPIOptions;
}

export interface CircleCI {
  readonly api: CircleCIAPI;
  readonly utils: ReturnType<typeof utils>;
  readonly authenticate: (options: CircleCIOptions) => Promise<CircleCI>;
}

export async function createCircleCI({ circleci: circleCIOptions }: CircleCIOptions): Promise<CircleCI> {
  const api = new CircleCIAPI(circleCIOptions);

  return {
    api,
    utils: utils(api),
    authenticate: createCircleCI,
  };
}
