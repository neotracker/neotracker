import {
  Client,
  LocalKeyStore,
  LocalMemoryStore,
  LocalUserAccountProvider,
  NEOONEProvider,
} from '@neo-one/client-core';
import { SchemaLink } from '@neotracker/server-graphql';
import { CodedError, resolveRootPath } from '@neotracker/server-utils';
import { QueryDeduplicator } from '@neotracker/shared-graphql';
import { AppOptions, NetworkType } from '@neotracker/shared-utils';
import { App, ROUTE_CONFIGS, RouteQueryClass } from '@neotracker/shared-web-next';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import * as fs from 'fs';
import { Context } from 'koa';
import compose from 'koa-compose';
// tslint:disable-next-line: match-default-export-name
import compress from 'koa-compress';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import Helmet from 'react-helmet';
import LoadableExport from 'react-loadable';
// tslint:disable-next-line no-submodule-imports
import { getBundles } from 'react-loadable/webpack';
import { StaticRouter } from 'react-router';
import { MatchedRoute, matchRoutes } from 'react-router-config';
import { BehaviorSubject } from 'rxjs';
import { ServerStyleSheet } from 'styled-components';
import { getNonce, getQueryDeduplicator, getUserAgent } from '../common';
import { AddBodyElements, AddHeadElements, makeServerHTML } from './makeServerHTML';

export { AddBodyElements, AddHeadElements };

const getStats = (statsPath: string) => JSON.parse(fs.readFileSync(resolveRootPath(statsPath), 'utf8'));

const provider = new LocalUserAccountProvider({
  keystore: new LocalKeyStore(new LocalMemoryStore()),
  provider: new NEOONEProvider(),
});

const client = new Client({
  memory: provider,
  localStorage: new LocalUserAccountProvider({
    keystore: new LocalKeyStore(new LocalMemoryStore()),
    provider: new NEOONEProvider(),
  }),
});

const renderApp = async ({
  match,
  css,
  location,
  stats,
  nonce,
  userAgent,
  network,
  appOptions,
  queryDeduplicator,
}: {
  // tslint:disable-next-line no-any
  readonly match: MatchedRoute<any>;
  readonly css: ReadonlyArray<string>;
  readonly location: string;
  // tslint:disable-next-line no-any
  readonly stats: any;
  readonly nonce: string;
  readonly userAgent: IUAParser.IResult;
  readonly network: NetworkType;
  readonly appOptions: AppOptions;
  readonly queryDeduplicator: QueryDeduplicator;
}) => {
  const apollo = new ApolloClient({
    cache: new InMemoryCache(),
    link: new SchemaLink(queryDeduplicator),
    ssrMode: true,
    queryDeduplication: false,
  });

  // tslint:disable-next-line no-any
  const context: any = {};
  const mutableModules: string[] = [];
  const pushModule = (moduleName: string) => mutableModules.push(moduleName);

  const appContext = {
    apollo,
    css,
    nonce,
    options$: new BehaviorSubject(appOptions),
    network,
    client,
    userAgent,
    fileSaver: {
      saveAs: () => {
        // do nothing
      },
    },
  };
  const app = (
    <LoadableExport.Capture report={pushModule}>
      <StaticRouter location={location} context={context} basename="">
        <App appContext={appContext} />
      </StaticRouter>
    </LoadableExport.Capture>
  );

  const { component } = match.route;
  // tslint:disable-next-line no-any
  const Component: RouteQueryClass<any> = await (component as any).preload();
  await Component.fetchDataForRoute(appContext, match.match);

  const sheet = new ServerStyleSheet();
  const reactAppString = renderToString(sheet.collectStyles(app));
  const reactHelmet = Helmet.renderStatic();
  const bundles = getBundles(stats, mutableModules);

  return {
    reactAppString,
    reactHelmet,
    apolloState: apollo.extract(),
    styles: sheet.getStyleElement(),
    routePath: context.routePath,
    missed: context.missed,
    bundles,
  };
};

export interface Environment {
  readonly appVersion: string;
}
export interface Options {
  readonly clientAssetsPath: string;
  readonly statsPath: string;
  readonly publicPath: string;
  readonly rpcURL: string;
  readonly adsenseID?: string;
  readonly bsaEnabled?: boolean;
}

// tslint:disable-next-line export-name
export const reactApp = ({
  addHeadElements,
  addBodyElements,
  googleAnalyticsTag,
  environment,
  options,
  network,
  appOptions,
}: {
  readonly addHeadElements: AddHeadElements;
  readonly addBodyElements: AddBodyElements;
  readonly googleAnalyticsTag: string;
  readonly environment: Environment;
  readonly options: Options;
  readonly network: NetworkType;
  readonly appOptions: AppOptions;
}) => {
  const stats = getStats(options.statsPath);

  return {
    type: 'route',
    method: 'get',
    name: 'reactApplication',
    path: '/*',
    middleware: compose([
      compress(),
      async (ctx: Context): Promise<void> => {
        const nonce = getNonce(ctx);
        const userAgent = getUserAgent(ctx);
        const queryDeduplicator = getQueryDeduplicator(ctx);
        const css: ReadonlyArray<string> = [];

        // tslint:disable-next-line no-any
        const match = matchRoutes(ROUTE_CONFIGS as any, ctx.request.path);
        // tslint:disable-next-line strict-type-predicates
        if (match == undefined || match.length === 0) {
          throw new CodedError(CodedError.PROGRAMMING_ERROR);
        }

        const { bundles, reactAppString, reactHelmet, apolloState, styles, missed } = await renderApp({
          match: match[0],
          css,
          location: ctx.request.url,
          stats,
          nonce,
          userAgent,
          network,
          appOptions,
          queryDeduplicator,
        });

        const bundlePaths = [
          ...new Set(
            bundles
              // tslint:disable-next-line no-any
              .map((bundle: any) => bundle.publicPath)
              .concat([`${options.publicPath}vendors~index.js`, `${options.publicPath}index.js`]),
          ),
        ].filter((scriptPath) => !scriptPath.endsWith('.map'));
        const html = makeServerHTML({
          css,
          js: bundlePaths,
          reactAppString,
          nonce,
          googleAnalyticsTag,
          helmet: reactHelmet,
          apolloState,
          styles,
          userAgent,
          network,
          appOptions,
          appVersion: environment.appVersion,
          addHeadElements,
          addBodyElements,
          adsenseID: options.adsenseID,
          bsaEnabled: options.bsaEnabled,
        });

        ctx.type = 'html';
        ctx.status = missed ? 404 : 200;

        ctx.body = html;
      },
    ]),
  };
};
