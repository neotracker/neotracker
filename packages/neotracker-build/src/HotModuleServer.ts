import * as chokidar from 'chokidar';
import { HotServer } from './HotServer';
import { log } from './log';

const title = 'hot-server';

export abstract class HotModuleServer implements HotServer {
  protected abstract readonly createHotServer: (() => HotServer);
  private readonly paths: ReadonlyArray<string>;
  private readonly modules: ReadonlyArray<string>;
  private mutableWatcher: chokidar.FSWatcher | undefined;
  private mutableHotServer: HotServer | undefined;

  public constructor(paths: ReadonlyArray<string>, modules: ReadonlyArray<string>) {
    this.paths = paths;
    this.modules = modules;
  }

  public async start(): Promise<void> {
    let mutableHotServer = await this.requireAndStart();

    this.mutableWatcher = chokidar.watch([...this.paths]);
    this.mutableWatcher.on('change', () => {
      log({
        title,
        level: 'warn',
        message: 'Project build configuration has changed. Restarting the ' + 'hot server...',
      });

      // tslint:disable-next-line no-floating-promises
      mutableHotServer.stop().then(async () => {
        Object.keys(require.cache).forEach((modulePath) => {
          if (this.modules.some((module) => modulePath.indexOf(module) !== -1)) {
            // tslint:disable-next-line no-dynamic-delete no-object-mutation
            delete require.cache[modulePath];
          }
        });

        mutableHotServer = await this.requireAndStart();
      });
    });
  }

  public async stop(): Promise<void> {
    if (this.mutableWatcher !== undefined) {
      this.mutableWatcher.close();
    }

    if (this.mutableHotServer !== undefined) {
      await this.mutableHotServer.stop();
    }
  }

  public async requireAndStart(): Promise<HotServer> {
    const mutableHotServer = this.createHotServer();
    await mutableHotServer.start();
    this.mutableHotServer = mutableHotServer;

    return mutableHotServer;
  }
}
