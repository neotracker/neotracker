/* @flow */
import pkg from '../../../package.json';

export type Type = 'client-web' | 'server-web' | 'node';

const getPresets = ({ type }: {| type: Type |}) =>
  [
    type === 'client-web' || type === 'server-web'
      ? '@babel/preset-react'
      : null,
    [
      '@babel/preset-env',
      {
        targets:
          type === 'client-web'
            ? { browsers: pkg.browserslist }
            : { node: true },
        modules: false,
        useBuiltIns: type === 'client-web' ? 'entry' : false,
        ignoreBrowserslistConfig: true,
      },
    ],
  ].filter(Boolean);

const getPlugins = ({ type }: {| type: Type |}) =>
  [
    type === 'client-web' || type === 'server-web'
      ? 'babel-plugin-relay'
      : null,
    '@babel/proposal-async-generator-functions',
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-transform-flow-strip-types',
  ].filter(Boolean);

export default ({
  type,
  include,
  presets,
  plugins,
  fast,
}: {|
  type: Type,
  include: Array<string>,
  presets?: Array<any>,
  plugins?: Array<any>,
  fast?: boolean,
|}) => {
  let exclude = [
    /@babel/,
    /babel-/,
    /core-js/,
    /regenerator-runtime/,
    /react-redux/,
  ];
  if (fast) {
    exclude = (exclude.concat([/node_modules/]): Array<RegExp>);
  }
  return {
    test: /\.m?jsx?$/,
    type: 'javascript/auto',
    include,
    exclude,
    use: {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        babelrc: false,
        presets: ((presets || []).concat(getPresets({ type })): Array<any>),
        plugins: ((plugins || []).concat(getPlugins({ type })): Array<any>),
      },
    },
  };
};
