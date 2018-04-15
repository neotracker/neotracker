/* @flow */
import type { HotServer } from './HotServer';

import logError from './logError';
import setupProcessListeners from './setupProcessListeners';

const title = 'hot-server';

export default class HotEntryServer {
  shutdownFuncs: Array<() => Promise<void> | void>;

  constructor() {
    this.shutdownFuncs = [];
  }

  async start(): Promise<void> {
    try {
      await this._startInternal();
    } catch (error) {
      logError({
        title,
        message: 'Failed to start hot server... Exiting.',
        error,
      });
      this._exit(1);
    }
  }

  async stop(): Promise<void> {
    await Promise.all(this.shutdownFuncs.map(func => func()));
    this.shutdownFuncs = [];
  }

  async _startInternal(): Promise<void> {
    setupProcessListeners({
      title,
      exit: this._exit.bind(this),
    });

    await this._start();
  }

  // eslint-disable-next-line
  async _start(): Promise<void> {}

  async _exit(exitCode: number): Promise<void> {
    try {
      await this.stop();
    } catch (error) {
      logError({
        title,
        message: 'Encountered error while exiting.',
        error,
      });
    }
    process.exit(exitCode);
  }

  async _startHotServer(server: HotServer): Promise<void> {
    await server.start();
    this.shutdownFuncs.push(() => server.stop());
  }
}
