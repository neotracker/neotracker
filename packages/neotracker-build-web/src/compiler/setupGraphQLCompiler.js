/* @flow */
import type webpack from 'webpack';

import executeGraphQLCompiler from './executeGraphQLCompiler';

export default ({
  compiler,
  graphqlOutputPath,
  jsonOutputPath,
}: {|
  compiler: webpack,
  graphqlOutputPath: string,
  jsonOutputPath: string,
|}) => {
  let executing = false;
  compiler.plugin('done', stats => {
    if (!stats.hasErrors() && !executing) {
      executing = true;
      executeGraphQLCompiler({
        compiler,
        graphqlOutputPath,
        jsonOutputPath,
      }).then(
        () => {
          executing = false;
        },
        () => {
          executing = false;
        },
      );
    }
  });

  return compiler;
};
