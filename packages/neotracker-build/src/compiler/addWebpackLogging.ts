import webpack from 'webpack';
import { log } from '../log';

export const addWebpackLogging = ({
  title,
  compiler,
}: {
  readonly title: string;
  readonly compiler: webpack.Compiler;
}) => {
  compiler.hooks.compile.tap('Logging', () => {
    log({
      title,
      level: 'info',
      message: 'Building new bundle...',
    });
  });

  compiler.hooks.done.tap('Logging', (stats) => {
    if (stats.hasErrors()) {
      log({
        title,
        level: 'error',
        message: 'Build failed, please check the console for more information.',
      });

      log({
        title,
        level: 'error',
        message: stats.toString(),
      });
    } else {
      log({
        title,
        level: 'info',
        message: 'Compilation complete.',
      });
    }
  });

  return compiler;
};
