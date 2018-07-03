import { HotWebEntryServer } from './HotWebEntryServer';
import { getOptions } from './options';

const { options, network } = getOptions({ port: 1340 });

const server = new HotWebEntryServer({
  clientAssetsPath: options.server.react.clientAssetsPath,
  clientBundlePath: options.server.clientAssets.path,
  env: { NEOTRACKER_NETWORK: network },
});

// tslint:disable-next-line no-floating-promises
server.start();
