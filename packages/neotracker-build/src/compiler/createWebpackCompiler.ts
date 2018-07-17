import webpack from 'webpack';
import { log } from '../log';
import { logError } from '../logError';
import { addWebpackLogging } from './addWebpackLogging';

const title = 'build';

export const createWebpackCompiler = ({
  target,
  config,
  isCI,
}: {
  readonly target: string;
  readonly config: webpack.Configuration;
  readonly isCI: boolean;
}) => {
  try {
    log({
      title,
      level: 'info',
      message: `Creating a bundle configuration for the ${target}`,
    });

    if (!isCI) {
      // tslint:disable-next-line
      config.plugins!.push(new webpack.ProgressPlugin());
    }
    const compiler = webpack(config);

    return addWebpackLogging({ title: target, compiler });
  } catch (error) {
    logError({
      title,
      message: 'Webpack config is invalid, please check the console for ' + 'more information.',
      error,
    });

    throw error;
  }
};
