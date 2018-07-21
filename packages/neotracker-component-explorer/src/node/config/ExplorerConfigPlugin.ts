import webpack from 'webpack';
import { ExplorerConfig } from '../../types';

export class ExplorerConfigPlugin {
  private readonly config: ExplorerConfig;

  public constructor(config: ExplorerConfig) {
    this.config = config;
  }

  public apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap('StyleguidistOptionsPlugin', (compilation) => {
      compilation.hooks.normalModuleLoader.tap('StyleguidistOptionsPlugin', (context) => {
        // tslint:disable-next-line no-object-mutation
        context._explorer = this.config;
      });
    });
  }
}
