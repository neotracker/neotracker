/* @flow */
import type webpack from 'webpack';

import log from './log';

export default ({ title, compiler }: { title: string, compiler: webpack }) => {
  compiler.plugin('compile', () => {
    log({
      title,
      level: 'info',
      message: 'Building new bundle...',
    });
  });

  compiler.plugin('done', stats => {
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
