/* @flow */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import gulp from 'gulp';

import log from './log';

const title = 'hot-server';

export class HotServer {
  // eslint-disable-next-line
  async start(): Promise<void> {}
  // eslint-disable-next-line
  async stop(): Promise<void> {}
}

export default class HotModuleServer {
  _paths: Array<string>;
  _modules: Array<string>;
  _watcher: ?Object;
  _hotServer: ?HotServer;

  constructor(paths: Array<string>, modules: Array<string>) {
    this._paths = paths;
    this._modules = modules;
    this._watcher = null;
    this._hotServer = null;
  }

  +createHotServer: () => HotServer;

  async start(): Promise<void> {
    let hotServer = await this.requireAndStart();

    this._watcher = gulp.watch(this._paths, () => {
      log({
        title,
        level: 'warn',
        message:
          'Project build configuration has changed. Restarting the ' +
          'hot server...',
      });
      hotServer.stop().then(async () => {
        Object.keys(require.cache).forEach(modulePath => {
          if (this._modules.some(module => modulePath.indexOf(module) !== -1)) {
            delete require.cache[modulePath];
          }
        });

        hotServer = await this.requireAndStart();
      });
    });
  }

  async stop(): Promise<void> {
    if (this._watcher != null) {
      this._watcher.close();
    }

    if (this._hotServer != null) {
      await this._hotServer.stop();
    }
  }

  async requireAndStart(): Promise<HotServer> {
    const hotServer = this.createHotServer();
    await hotServer.start();
    this._hotServer = hotServer;
    return hotServer;
  }
}
