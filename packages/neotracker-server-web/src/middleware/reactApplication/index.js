/* @flow */
import {
  type AppOptions,
  App,
  AppServer,
  ThemeProvider,
  configureStore,
  createTheme,
  routeConfigs,
} from 'neotracker-shared-web';
import {
  type NetworkType,
  Client,
  LocalKeyStore,
  LocalMemoryStore,
  LocalUserAccountProvider,
  NEOONEDataProvider,
  NEOONEProvider,
  ReadClient,
} from '@neo-one/client';
import { CodedError } from 'neotracker-server-utils';
import type { Context } from 'koa';
import Helmet from 'react-helmet';
import { JssProvider, SheetsRegistry } from 'react-jss';
import type { Monitor } from '@neo-one/monitor';
import { Provider } from 'react-redux';
import * as React from 'react';
import {
  RelaySSRQueryCache,
  makeRelayEnvironment,
  schema,
} from 'neotracker-server-graphql';
import type { RootLoader } from 'neotracker-server-db';
import { StaticRouter } from 'react-router';
import type { UserAgent } from 'neotracker-shared-utils';

import appRootDir from 'app-root-dir';
import compose from 'koa-compose';
import compress from 'koa-compress';
import createGenerateClassName from '@material-ui/core/styles/createGenerateClassName';
import { create } from 'jss';
import fs from 'fs';
import { matchRoutes } from 'react-router-config';
import { of as _of } from 'rxjs';
import path from 'path';
import preset from 'jss-preset-default';
import { renderToString } from 'react-dom/server';
import { getMonitor } from 'neotracker-server-utils-koa';

import { getNonce, getRootLoader, getUserAgent } from '../common';
import makeServerHTML, {
  type AddHeadElements,
  type AddBodyElements,
} from './makeServerHTML';

export type { AddHeadElements, AddBodyElements } from './makeServerHTML';

const provider = new LocalUserAccountProvider({
  keystore: new LocalKeyStore({
    store: new LocalMemoryStore(),
  }),
  provider: new NEOONEProvider(),
});
const client = new Client({
  memory: provider,
  localStorage: new LocalUserAccountProvider({
    keystore: new LocalKeyStore({
      store: new LocalMemoryStore('localStorage'),
    }),
    provider: new NEOONEProvider(),
  }),
});

const renderAppShell = (
  monitor: Monitor,
  network: NetworkType,
  appOptions: AppOptions,
) => {
  const store = configureStore(false);
  const theme = createTheme();
  const sheetsRegistry = new SheetsRegistry();
  const jss = create(preset());
  jss.options.createGenerateClassName = createGenerateClassName;
  const app = (
    <JssProvider registry={sheetsRegistry} jss={jss}>
      <ThemeProvider theme={theme} sheetsManager={new Map()}>
        <StaticRouter location="/" context={{}} basename="">
          <Provider store={store}>
            <AppServer
              appContext={
                ({
                  css: [],
                  nonce: '1234',
                  options$: _of(appOptions),
                  monitor,
                  network,
                  client,
                  userAgent: {},
                }: $FlowFixMe)
              }
            />
          </Provider>
        </StaticRouter>
      </ThemeProvider>
    </JssProvider>
  );

  const appShell = renderToString(app);
  const helmet = Helmet.renderStatic();
  const appStyles = sheetsRegistry.toString();

  return {
    reactAppString: appShell,
    reactHelmet: helmet,
    relay: undefined,
    records: undefined,
    styles: appStyles,
  };
};

const renderApp = async ({
  match,
  location,
  rootLoader,
  css,
  nonce,
  monitor,
  userAgent,
  network,
  appOptions,
}: {|
  match: Array<Object>,
  location: string,
  rootLoader: RootLoader,
  css: Array<string>,
  nonce: string,
  monitor: Monitor,
  userAgent: UserAgent,
  network: NetworkType,
  appOptions: AppOptions,
|}) => {
  const relaySSRQueryCache = new RelaySSRQueryCache();
  const relayEnvironment = makeRelayEnvironment({
    monitor,
    rootLoader,
    schema,
    relaySSRQueryCache,
  });

  // $FlowFixMe
  await App.asyncBootstrap(match[0], relayEnvironment);

  const store = configureStore(false);
  const context = {};
  const theme = createTheme();
  const sheetsRegistry = new SheetsRegistry();
  const jss = create(preset());
  jss.options.createGenerateClassName = createGenerateClassName;

  const readClient = new ReadClient(
    new NEOONEDataProvider({
      network,
      rpcURL: appOptions.rpcURL,
    }),
  );
  const app = (
    <JssProvider registry={sheetsRegistry} jss={jss}>
      <ThemeProvider theme={theme} sheetsManager={new Map()}>
        <StaticRouter location={location} context={context} basename="">
          <Provider store={store}>
            <App
              relayEnvironment={relayEnvironment}
              appContext={{
                environment: relayEnvironment,
                css,
                nonce,
                options$: _of(appOptions),
                monitor,
                network,
                client,
                readClient,
                userAgent,
                fileSaver: {
                  saveAs: () => {},
                },
              }}
            />
          </Provider>
        </StaticRouter>
      </ThemeProvider>
    </JssProvider>
  );

  const reactAppString = renderToString(app);
  const relay = () => relaySSRQueryCache.toData();
  const records = () =>
    relayEnvironment
      .getStore()
      .getSource()
      .toJSON();
  const reactHelmet = Helmet.renderStatic();
  const styles = sheetsRegistry.toString();

  return {
    reactAppString,
    reactHelmet,
    relay,
    records,
    styles,
  };
};

const getAssets = (clientAssetsPath: string) =>
  JSON.parse(
    fs.readFileSync(path.resolve(appRootDir.get(), clientAssetsPath), 'utf8'),
  ).index;

export type Environment = {|
  appVersion: string,
|};

export type Options = {|
  clientAssetsPath: string,
  ssr: {|
    enabled: boolean,
    userAgents: string,
  |},
  rpcURL: string,
  adsenseID?: string,
|};

export default ({
  monitor: baseMonitor,
  addHeadElements,
  addBodyElements,
  environment,
  options,
  network,
  appOptions,
}: {|
  monitor: Monitor,
  addHeadElements: AddHeadElements,
  addBodyElements: AddBodyElements,
  environment: Environment,
  options: Options,
  network: NetworkType,
  appOptions: AppOptions,
|}) => {
  const userAgents = new RegExp(options.ssr.userAgents);
  const appShellResult = renderAppShell(baseMonitor, network, appOptions);
  const asset = getAssets(options.clientAssetsPath);

  return {
    type: 'route',
    method: 'get',
    name: 'reactApplication',
    path: '/*',
    middleware: compose([
      compress(),
      async (ctx: Context): Promise<void> => {
        const nonce = getNonce(ctx);
        const rootLoader = getRootLoader(ctx);
        const monitor = getMonitor(ctx);
        const userAgent = getUserAgent(ctx);

        const match = matchRoutes(routeConfigs, ctx.request.path);
        if (match == null || match.length === 0) {
          throw new CodedError(CodedError.PROGRAMMING_ERROR);
        }

        const missed = match[0].route.path == null;
        const routePath = match[0].route.path;
        if (routePath != null) {
          monitor.setLabels({ [monitor.labels.HTTP_PATH]: routePath });
        }

        const isSSR = options.ssr.enabled && userAgents.test(userAgent.ua);
        const {
          reactAppString,
          reactHelmet,
          relay,
          records,
          styles,
        } = await (isSSR
          ? renderApp({
              match,
              location: ctx.request.url,
              rootLoader,
              css: [asset.css],
              nonce,
              monitor,
              userAgent,
              network,
              appOptions,
            })
          : appShellResult);

        const html = makeServerHTML({
          css: [asset.css],
          js: [asset.js],
          reactAppString,
          nonce,
          helmet: reactHelmet,
          relay,
          records,
          styles,
          userAgent,
          network,
          appOptions,
          appVersion: environment.appVersion,
          addHeadElements,
          addBodyElements,
          adsenseID: options.adsenseID,
        });

        ctx.type = 'html';
        ctx.status = missed ? 404 : 200;

        ctx.body = html;
      },
    ]),
  };
};
