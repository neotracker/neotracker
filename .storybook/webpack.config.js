const path = require('path');
const TSDocgenPlugin = require('react-docgen-typescript-webpack-plugin');
const pkg = require('../package.json');

module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: 'awesome-typescript-loader',
        options: {
          useTranspileModule: true,
          transpileOnly: true,
          useBabel: true,
          babelOptions: {
            babelrc: false,
            presets: [
              '@babel/preset-react',
              [
                '@babel/preset-env',
                {
                  targets: { browsers: pkg.browserslist },
                  modules: false,
                  useBuiltIns: 'entry',
                  ignoreBrowserslistConfig: true,
                },
              ],
            ],
            plugins: [
              '@babel/proposal-async-generator-functions',
              '@babel/proposal-class-properties',
              '@babel/proposal-object-rest-spread',
            ],
          },
          babelCore: '@babel/core',
          useCache: true,
          configFileName: 'tsconfig.compile.json',
        },
      },
      {
        loader: 'react-docgen-typescript-loader',
        options: {
          tsconfigPath: 'tsconfig.compile.json',
        },
      },
    ],
  });
  config.plugins.push(new TSDocgenPlugin()); // optional
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
