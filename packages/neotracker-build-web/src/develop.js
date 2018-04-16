/* @flow */
import HotWebEntryServer from './HotWebEntryServer';

import { getOptions } from './options';

const { options, network } = getOptions({ port: 1340 });

const server = new HotWebEntryServer({
  clientAssetsPath: options.react.clientAssetsPath,
  clientBundlePath: options.clientAssets.path,
  env: { NEOTRACKER_NETWORK: network },
});
server.start();
