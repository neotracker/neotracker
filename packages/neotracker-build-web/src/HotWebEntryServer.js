/* @flow */
import { HotEntryServer } from 'neotracker-build-utils';

import HotWebServer from './HotWebServer';

export default class HotWebEntryServer extends HotEntryServer {
  server: HotWebServer;
  constructor(options: {|
    clientAssetsPath: string,
    clientBundlePath: string,
  |}) {
    super();
    this.server = new HotWebServer(options);
  }

  async _start(): Promise<void> {
    await this.server.start();
    this.shutdownFuncs.push(() => this.server.stop());
  }
}
