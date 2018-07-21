import { getExplorerConfig } from '../config';
import { createServer } from '../createServer';
import { Runner } from './Runner';

export class ServerRunner extends Runner {
  private mutableDoneCB: ((error?: Error) => void) | undefined;
  // tslint:disable-next-line no-any
  private mutableServer: any;

  protected executeCallback(cb: (error?: Error) => void): void {
    this.mutableDoneCB = cb;
    const config = getExplorerConfig();
    createServer(config)
      .then(({ app }) => {
        this.mutableServer = app;
      })
      .catch(cb);
  }

  protected async cleanup(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.mutableServer.close(resolve);
    });
    if (this.mutableDoneCB) {
      this.mutableDoneCB();
    }
  }
}
