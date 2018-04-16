/* @flow */
import HotWebEntryServer from './HotWebEntryServer';

import { main, test } from './options';

const isTestNet = process.env.IS_TEST_NET === 'true';
const options = isTestNet ? test : main;

const server = new HotWebEntryServer({
  clientAssetsPath: options.react.clientAssetsPath,
  clientBundlePath: options.clientAssets.path,
});
server.start();
