// eslint-disable-next-line
const webpack = require('@cypress/webpack-preprocessor');

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
                  useBabel: false,
                  useCache: true,
                  configFileName: 'cypress/tsconfig.json',
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
