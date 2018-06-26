import { HotServer } from './HotServer';
import { logError } from './logError';
import { setupProcessListeners } from './setupProcessListeners';

const title = 'hot-server';

export abstract class HotEntryServer implements HotServer {
  public mutableShutdownFuncs: Array<() => Promise<void> | void>;

  public constructor() {
    this.mutableShutdownFuncs = [];
  }

  public async start(): Promise<void> {
    try {
      await this.startInternal();
    } catch (error) {
      logError({
        title,
        message: 'Failed to start hot server... Exiting.',
        error,
      });

      await this.exit(1);
    }
  }

  public async stop(): Promise<void> {
    await Promise.all(this.mutableShutdownFuncs.map((func) => func()));
    this.mutableShutdownFuncs = [];
  }

  protected abstract async startExclusive(): Promise<void>;

  protected async startHotServer(server: HotServer): Promise<void> {
    await server.start();
    this.mutableShutdownFuncs.push(async () => server.stop());
  }

  private async startInternal(): Promise<void> {
    setupProcessListeners({
      title,
      exit: this.exit.bind(this),
    });

    await this.startExclusive();
  }

  private async exit(exitCode: number): Promise<void> {
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
}
