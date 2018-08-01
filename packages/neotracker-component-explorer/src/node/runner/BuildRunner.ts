import webpack from 'webpack';
import { getExplorerConfig } from '../config';
import { createWebpackConfig } from '../createWebpackConfig';
import { Runner, RunnerOptions as Options } from './Runner';

export interface StaticOptions {
  readonly outDir?: string;
  readonly publicPath?: string;
  readonly router: 'browser' | 'memory';
}

export interface BuildRunnerOptions extends Options {
  readonly staticOptions?: StaticOptions;
}

export class BuildRunner extends Runner {
  private readonly staticOptions: StaticOptions | undefined;

  public constructor({ isCI, staticOptions }: BuildRunnerOptions) {
    super({ isCI });
    this.staticOptions = staticOptions;
  }

  public async executeAsync(): Promise<void> {
    const explorerConfig = getExplorerConfig();
    const config = createWebpackConfig(explorerConfig, this.staticOptions);
    const compiler = webpack(config);
    await new Promise<void>((resolve, reject) =>
      compiler.run((error: Error | undefined, stats) => {
        if (error) {
          reject(error);
        } else if (stats.hasErrors()) {
          reject(new Error('Compilation failed'));
        } else {
          resolve();
        }
      }),
    );
  }
}
