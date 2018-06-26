import webpack from 'webpack';
import { addWebpackLogging } from './addWebpackLogging';
import { log } from './log';
import { logError } from './logError';

const title = 'build';

export const createWebpackCompiler = ({
  target,
  config,
}: {
  readonly target: string;
  readonly config: webpack.Configuration;
}) => {
  try {
    log({
      title,
      level: 'info',
      message: `Creating a bundle configuration for the ${target}`,
    });

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
