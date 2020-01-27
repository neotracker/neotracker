export interface RunnerOptions {
  readonly isCI: boolean;
  readonly autoExit?: boolean;
}

export abstract class Runner {
  protected readonly isCI: boolean;
  protected readonly autoExit: boolean;
  private mutableExiting = false;

  public constructor({ isCI, autoExit = true }: RunnerOptions) {
    this.isCI = isCI;
    this.autoExit = autoExit;
  }

  public execute(): void {
    // tslint:disable-next-line no-floating-promises
    Promise.resolve().then(async () => {
      let exit;
      try {
        this.setupProcessListeners();
        await this.executeAsync();
        this.log('Done.');
        exit = 0;
      } catch (error) {
        this.logError(error);
        this.log('Failed.');
        exit = 1;
      } finally {
        if (this.autoExit || exit === 1) {
          this.exit(exit === undefined ? 0 : exit);
        }
      }
    });
  }

  public async executeAsync(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.executeCallback((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  protected executeCallback(cb: (error?: Error) => void): void {
    cb();
  }

  protected async cleanup(): Promise<void> {
    await Promise.resolve();
  }

  protected log(value: string): void {
    // tslint:disable-next-line no-console
    console.log(value);
  }

  protected logError(error: Error): void {
    // tslint:disable-next-line no-console
    console.error(error);
  }

  private exit(exitCode: number): void {
    if (!this.mutableExiting) {
      this.mutableExiting = true;
      this.cleanup()
        .then(() => {
          process.exit(exitCode);
        })
        .catch(() => {
          process.exit(exitCode === 0 ? 1 : exitCode);
        });
    }
  }

  private setupProcessListeners(): void {
    process.on('uncaughtException', (error) => {
      this.logError(error);
      this.exit(1);
    });

    process.on('SIGINT', () => {
      this.log('Exiting...');
      this.exit(0);
    });

    process.on('SIGTERM', () => {
      this.log('Exiting...');
      this.exit(0);
    });
  }
}
