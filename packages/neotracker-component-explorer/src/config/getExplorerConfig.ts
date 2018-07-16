import * as path from 'path';

import { Config } from './Config';

// tslint:disable-next-line no-let
let config: Config | undefined;
export const getExplorerConfig = (): Config => {
  if (config !== undefined) {
    return config;
  }

  config = getExplorerConfigInternal();

  return config;
};

const getExplorerConfigInternal = (): Config => {
  const configPath = path.resolve(process.cwd(), 'explorer.config.js');
  const userConfig = require(configPath);

  return {
    proxies: userConfig.proxies === undefined ? [] : require(userConfig.proxies),
  };
};
