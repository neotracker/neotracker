// @ts-ignore
import NodeEnvironment from 'jest-environment-node';

export class NEOTrackerBase {
  public async setup() {
    // do nothing
  }

  public async teardown() {
    // do nothing
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
