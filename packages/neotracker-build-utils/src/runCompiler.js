/* @flow */
import type webpack from 'webpack';

export default ({ compiler }: {| compiler: webpack |}): Promise<Object> =>
  new Promise((resolve, reject) =>
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
      } else if (stats.hasErrors()) {
        reject(new Error('Compilation failed'));
      } else {
        resolve(stats);
      }
    }),
  );
