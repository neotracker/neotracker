import { utils } from '@neotracker/shared-utils';
import * as appRootDir from 'app-root-dir';
import * as fs from 'fs-extra';
import * as path from 'path';

// tslint:disable-next-line no-require-imports no-var-requires
const pkg = require('../../../../package.json');

export type Type = 'client-web' | 'server-web' | 'node';

const getPresets = ({ type, typescript }: { readonly type: Type; readonly typescript: boolean }) =>
  [
    // Current
    (type === 'client-web' || type === 'server-web') && !typescript ? '@babel/preset-react' : undefined,
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

// tslint:disable-next-line no-any
const styledComponents: ReadonlyArray<any> = [
  'babel-plugin-styled-components',
  {
    ssr: true,
  },
];
const graphqlTag = './packages/neotracker-build/src/babel/graphql-tag';
const getPlugins = ({ type, typescript }: { readonly type: Type; readonly typescript: boolean }) =>
  [
    // Syntax
    '@babel/plugin-syntax-dynamic-import',
    // Optimizations
    type === 'client-web' ? 'babel-plugin-lodash' : undefined,
    // ES2018 Features
    type === 'client-web' ? '@babel/plugin-proposal-object-rest-spread' : undefined,
    type === 'client-web' ? '@babel/plugin-proposal-async-generator-functions' : undefined,
    // ESNext features (only current)
    typescript ? undefined : '@babel/plugin-proposal-class-properties',
    typescript ? undefined : '@babel/plugin-proposal-export-namespace-from',
    typescript ? undefined : '@babel/plugin-proposal-optional-catch-binding',
    typescript ? undefined : '@babel/plugin-transform-flow-strip-types',
    // Next
    (type === 'client-web' || type === 'server-web') && typescript ? graphqlTag : undefined,
    (type === 'client-web' || type === 'server-web') && typescript ? 'react-loadable/babel' : undefined,
    (type === 'client-web' || type === 'server-web') && typescript ? styledComponents : undefined,
    // Current
    (type === 'client-web' || type === 'server-web') && !typescript ? 'babel-plugin-relay' : undefined,
  ].filter(utils.notNull);

export const createRules = ({
  type,
  fast = false,
}: {
  readonly type: Type;
  readonly fast?: boolean;
  // tslint:disable-next-line no-any readonly-array
}): any[] => {
  // Hack to make sure react-loadable has a directory to work with
  fs.mkdirpSync(path.resolve(appRootDir.get(), 'dist'));

  const babelLoader = {
    loader: 'babel-loader',
    options: {
      configFile: false,
      presets: getPresets({ type, typescript: false }),
      plugins: getPlugins({ type, typescript: false }),
      cacheDirectory: fast,
    },
  };

  const useBabel = type === 'client-web' || type === 'server-web';
  const typescriptLoader = {
    loader: 'awesome-typescript-loader',
    options: {
      useTranspileModule: type !== 'client-web' || fast,
      transpileOnly: true,
      useBabel,
      babelOptions: useBabel
        ? {
            configFile: false,
            presets: type === 'client-web' ? getPresets({ type, typescript: true }) : undefined,
            plugins: getPlugins({ type, typescript: true }),
          }
        : undefined,
      babelCore: '@babel/core',
      useCache: fast,
      configFileName: 'tsconfig/tsconfig.es2018.esm.json',
    },
  };

  const include = [
    path.resolve(appRootDir.get(), 'packages'),
    path.resolve(appRootDir.get(), 'node_modules', '@reactivex'),
    path.resolve(appRootDir.get(), 'node_modules', '@neo-one'),
  ];

  return [
    {
      test: /\.tsx?$/,
      include,
      use: typescriptLoader,
    },
    type === 'client-web' || type === 'server-web'
      ? {
          test: /\.m?jsx?$/,
          include,
          use: babelLoader,
        }
      : undefined,
  ].filter(utils.notNull);
};
