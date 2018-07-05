// eslint-disable-next-line
const webpack = require('@cypress/webpack-preprocessor');
const pkg = require('../../package.json');

module.exports = (on) => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: ['.ts', '.js'],
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: [/node_modules/],
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
                      '@babel/plugin-proposal-async-generator-functions',
                      '@babel/plugin-proposal-class-properties',
                      '@babel/plugin-proposal-object-rest-spread',
                    ],
                  },
                  babelCore: '@babel/core',
                  useCache: true,
                },
              },
            ],
          },
        ],
      },
    },
  };
  on('file:preprocessor', webpack(options));
};
