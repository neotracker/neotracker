/* @flow */
import webpack from 'webpack';

import addWebpackLogging from './addWebpackLogging';
import log from './log';
import logError from './logError';

const title = 'build';

export default ({ target, config }: { target: string, config: Object }) => {
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
      level: 'error',
      message:
        'Webpack config is invalid, please check the console for ' +
        'more information.',
      error,
      notify: true,
    });
    throw error;
  }
};
