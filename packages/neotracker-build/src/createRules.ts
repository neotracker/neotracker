import { utils } from 'neotracker-shared-utils';
import pkg from '../../../package.json';

export type Type = 'client-web' | 'server-web' | 'node';

const getPresets = ({ type }: { readonly type: Type }) =>
  [
    type === 'client-web' || type === 'server-web' ? '@babel/preset-react' : undefined,
    [
      '@babel/preset-env',
      {
        targets: type === 'client-web' ? { browsers: pkg.browserslist } : { node: true },
        modules: false,
        useBuiltIns: 'entry',
        ignoreBrowserslistConfig: true,
      },
    ],
  ].filter(utils.notNull);

const getPlugins = ({ type, typescript }: { readonly type: Type; readonly typescript: boolean }) =>
  [
    type === 'client-web' || type === 'server-web' ? 'babel-plugin-relay' : undefined,
    '@babel/proposal-async-generator-functions',
    '@babel/proposal-class-properties',
    type === 'client-web' ? '@babel/proposal-object-rest-spread' : undefined,
    typescript ? undefined : '@babel/plugin-proposal-export-namespace-from',
    typescript ? undefined : '@babel/plugin-transform-flow-strip-types',
  ].filter(utils.notNull);

export const createRules = ({
  type,
  include,
  presets = [],
  plugins = [],
  fast,
}: {
  readonly type: Type;
  readonly include: ReadonlyArray<string>;
  // tslint:disable-next-line no-any
  readonly presets?: ReadonlyArray<any>;
  // tslint:disable-next-line no-any
  readonly plugins?: ReadonlyArray<any>;
  readonly fast?: boolean;
}) => {
  let exclude = [/@babel/, /babel-/, /core-js/, /regenerator-runtime/, /react-redux/];

  if (fast) {
    exclude = exclude.concat([/node_modules/]);
  }

  const babelOptions = {
    babelrc: false,
    presets: presets.concat(getPresets({ type })),
  };
  const babelLoader = {
    loader: 'babel-loader',
    options: {
      ...babelOptions,
      plugins: plugins.concat(getPlugins({ type, typescript: false })),
      cacheDirectory: true,
    },
  };

  const typescriptLoader = {
    loader: 'awesome-typescript-loader',
    options: {
      useTranspileModule: true,
      transpileOnly: true,
      useBabel: true,
      babelOptions: {
        ...babelOptions,
        plugins: plugins.concat(getPlugins({ type, typescript: true })),
      },
      babelCore: '@babel/core',
      useCache: true,
      configFileName: 'tsconfig.compile.json',
    },
  };

  return [
    {
      test: /\.tsx?$/,
      include,
      exclude,
      use: typescriptLoader,
    },
    {
      test: /\.m?jsx?$/,
      include,
      exclude,
      use: babelLoader,
    },
  ];
};
