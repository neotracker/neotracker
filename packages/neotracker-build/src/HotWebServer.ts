import { createClientCompiler, createClientCompilerNext, createServerCompiler } from './compiler';
import { HotEntryServer } from './HotEntryServer';
import { HotWebServerBase } from './HotWebServerBase';

class HotWebCompilerServer extends HotWebServerBase {
  public constructor({ env, isCI }: { readonly env?: object; readonly isCI: boolean }) {
    const options = {
      serverCompiler: createServerCompiler({ isCI }),
      clientCompiler: createClientCompiler({
        dev: true,
        buildVersion: 'dev',
        isCI,
      }),
      clientCompilerNext: createClientCompilerNext({
        dev: true,
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

  public constructor(options: { readonly env?: object; readonly isCI: boolean }) {
    super();
    this.options = options;
  }

  protected async startExclusive(): Promise<void> {
    await this.startHotServer(new HotWebCompilerServer(this.options));
  }
}
