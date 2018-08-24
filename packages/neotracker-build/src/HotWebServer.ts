import { createClientCompiler, createClientCompilerNext, createServerCompiler } from './compiler';
import { HotEntryServer } from './HotEntryServer';
import { HotWebServerBase } from './HotWebServerBase';

class HotWebCompilerServer extends HotWebServerBase {
  public constructor({
    env,
    isCI,
    prod = false,
  }: {
    readonly env?: object;
    readonly isCI: boolean;
    readonly prod?: boolean;
  }) {
    const options = {
      serverCompiler: createServerCompiler({ isCI }),
      clientCompiler: createClientCompiler({
        dev: !prod,
        buildVersion: 'dev',
        isCI,
      }),
      clientCompilerNext: createClientCompilerNext({
        dev: !prod,
        buildVersion: 'dev',
        isCI,
      }),
      env,
      isCI,
    };
    super(options);
  }
}

export class HotWebServer extends HotEntryServer {
  public readonly options: { readonly env?: object; readonly isCI: boolean };

  public constructor(options: { readonly env?: object; readonly isCI: boolean; readonly prod?: boolean }) {
    super();
    this.options = options;
  }

  protected async startExclusive(): Promise<void> {
    await this.startHotServer(new HotWebCompilerServer(this.options));
  }
}
