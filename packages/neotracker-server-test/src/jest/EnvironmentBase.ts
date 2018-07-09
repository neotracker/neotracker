import { finalize as neoOneFinalize } from '@neo-one/utils';
import * as fs from 'fs-extra';
// @ts-ignore
import NodeEnvironment from 'jest-environment-node';
import { finalize } from 'neotracker-shared-utils';
import * as tmp from 'tmp';

export class NEOTrackerBase {
  private readonly mutableCleanup: Array<() => Promise<void> | void> = [
    async () => {
      await Promise.all([finalize.wait(), neoOneFinalize.wait()]);
    },
  ];

  public async setup() {
    // do nothing
  }

  public addCleanup(callback: () => Promise<void> | void): void {
    this.mutableCleanup.push(callback);
  }

  public async teardown(): Promise<void> {
    await Promise.all(this.mutableCleanup.map(async (callback) => callback()));
  }

  protected createDir(): string {
    const dir = tmp.dirSync().name;
    this.addCleanup(async () => {
      await fs.remove(dir);
    });

    return dir;
  }
}

export abstract class EnvironmentBase extends NodeEnvironment {
  // tslint:disable-next-line no-any
  protected readonly global: any;
  // tslint:disable-next-line no-any
  protected readonly testEnvironmentOptions: any;

  // tslint:disable-next-line no-any
  public constructor(config: any, options: any) {
    super(config, options);
    this.testEnvironmentOptions = config.testEnvironmentOptions == undefined ? {} : config.testEnvironmentOptions;
  }

  public async setup() {
    await super.setup();
    const neotracker = this.createNEOTracker();
    await neotracker.setup();
    // tslint:disable-next-line no-object-mutation
    this.global.neotracker = neotracker;
  }

  public async teardown() {
    if (this.global.neotracker !== undefined) {
      await this.global.neotracker.teardown();
    }
    await super.teardown();
  }

  // tslint:disable-next-line no-any
  public runScript(script: any) {
    return super.runScript(script);
  }

  protected abstract createNEOTracker(): NEOTrackerBase;
}
