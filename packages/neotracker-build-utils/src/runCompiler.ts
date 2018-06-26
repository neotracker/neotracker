import webpack from 'webpack';

export const runCompiler = async ({ compiler }: { readonly compiler: webpack.Compiler }): Promise<webpack.Stats> =>
  new Promise<webpack.Stats>((resolve, reject) =>
    compiler.run((error: Error | undefined, stats) => {
      if (error) {
        reject(error);
      } else if (stats.hasErrors()) {
        reject(new Error('Compilation failed'));
      } else {
        resolve(stats);
      }
    }),
  );
