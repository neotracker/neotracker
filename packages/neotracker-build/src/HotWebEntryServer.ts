import { HotEntryServer } from './HotEntryServer';
import { HotWebServer } from './HotWebServer';

export class HotWebEntryServer extends HotEntryServer {
  public readonly server: HotWebServer;

  public constructor(options: {
    readonly clientAssetsPath: string;
    readonly clientBundlePath: string;
    readonly env?: object;
  }) {
    super();
    this.server = new HotWebServer(options);
  }

  protected async startExclusive(): Promise<void> {
    await this.server.start();
    this.mutableShutdownFuncs.push(async () => this.server.stop());
  }
}
