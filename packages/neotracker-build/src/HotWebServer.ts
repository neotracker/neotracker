import { createClientCompiler, createClientCompilerNext, createServerCompiler } from './compiler';
import { HotEntryServer } from './HotEntryServer';
import { HotWebServerBase } from './HotWebServerBase';

class HotWebCompilerServer extends HotWebServerBase {
  public constructor({ env }: { readonly env?: object }) {
    const options = {
      serverCompiler: createServerCompiler(),
      clientCompiler: createClientCompiler({
        dev: true,
        buildVersion: 'dev',
      }),
      clientCompilerNext: createClientCompilerNext({
        dev: true,
        buildVersion: 'dev',
      }),
      env,
    };
    super(options);
  }
}

export class HotWebServer extends HotEntryServer {
  public readonly options: { readonly env?: object };

  public constructor(options: { readonly env?: object }) {
    super();
    this.options = options;
  }

  protected async startExclusive(): Promise<void> {
    await this.startHotServer(new HotWebCompilerServer(this.options));
  }
}
