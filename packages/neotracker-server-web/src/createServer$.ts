import {
  createFromEnvironment$,
  createRootLoader$,
  DBOptions,
  PubSubOptions,
  RootLoaderOptions,
  subscribeProcessedNextIndex,
} from '@neotracker/server-db';
import { LiveServer, QueryMap, schema, startRootCalls$ } from '@neotracker/server-graphql';
import { finalizeServer, handleServer, HandleServerResult, resolveRootPath } from '@neotracker/server-utils';
import {
  context,
  onError as createOnError,
  routeMiddleware,
  ServerMiddleware,
  ServerRoute,
} from '@neotracker/server-utils-koa';
import { finalize, mergeScanLatest, NetworkType, sanitizeError, utils } from '@neotracker/shared-utils';
// @ts-ignore
import { AppOptions, routes } from '@neotracker/shared-web';
import { routes as nextRoutes } from '@neotracker/shared-web-next';
import http from 'http';
import https from 'https';
import Application from 'koa';
import * as path from 'path';
import LoadableExport from 'react-loadable';
import { combineLatest, defer, merge, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, publishReplay, refCount, switchMap } from 'rxjs/operators';
import {
  AddBodyElements,
  AddHeadElements,
  clientAssets,
  clientAssetsNext,
  cors,
  graphql,
  healthCheck,
  nodeRPC,
  publicAssets,
  ratelimit,
  RateLimitOptions,
  reactApp,
  ReactAppEnvironment,
  reactApplication,
  ReactAppOptions,
  ReactEnvironment,
  ReactOptions,
  redirectURL as redirectMiddleware,
  report,
  rootAssets,
  security,
  SecurityOptions,
  ServeAssetsOptions,
  setRootLoader,
  sitemap,
  toobusy,
  TooBusyOptions,
} from './middleware';
export interface HTTPServerEnvironment {
  readonly host: string;
  readonly port: number;
}
export interface HTTPServerOptions {
  readonly keepATimeoutMS: number;
}
export interface QueryMapEnvironment {
  readonly queriesPath: string;
  readonly nextQueriesDir: string;
}

export interface APIKeys {
  readonly coinMarketCap: string;
  readonly googleAnalyticsTag: string;
}

export interface Environment {
  readonly react: ReactEnvironment;
  readonly reactApp: ReactAppEnvironment;
  readonly server: HTTPServerEnvironment;
  readonly network: NetworkType;
  readonly queryMap?: QueryMapEnvironment;
  readonly apiKeys: APIKeys;
}
export interface Options {
  readonly db: DBOptions;
  readonly rootLoader: RootLoaderOptions;
  readonly rateLimit: RateLimitOptions;
  readonly react: ReactOptions;
  readonly reactApp: ReactAppOptions;
  readonly toobusy: TooBusyOptions;
  readonly security: SecurityOptions;
  readonly clientAssets: ServeAssetsOptions;
  readonly clientAssetsNext: ServeAssetsOptions;
  readonly publicAssets: ServeAssetsOptions;
  readonly rootAssets: ServeAssetsOptions;
  readonly domain: string;
  readonly rpcURL: string;
  readonly reportURL?: string;
  readonly server: HTTPServerOptions;
  readonly appOptions: AppOptions;
  readonly subscribeProcessedNextIndex: PubSubOptions;
  readonly serveNext: boolean;
}
export type AddMiddleware = (
  middleware: ReadonlyArray<ServerMiddleware | ServerRoute>,
) => ReadonlyArray<ServerMiddleware | ServerRoute>;
export interface ServerCreateOptions {
  readonly options: Options;
  readonly addMiddleware?: AddMiddleware;
  readonly addHeadElements?: AddHeadElements;
  readonly addBodyElements?: AddBodyElements;
}

const noOpAddMiddleware = (middleware: ReadonlyArray<ServerMiddleware | ServerRoute>) => middleware;
const noOpAddHeadElements = () => [];
const noOpAddBodyElements = () => [];

const RATE_LIMIT_ERROR_CODE = 429;

export const createServer$ = ({
  environment,
  createOptions$,
}: {
  readonly environment: Environment;
  readonly createOptions$: Observable<ServerCreateOptions>;
}) => {
  function mapDistinct$<Out>(func: (value: ServerCreateOptions) => Out): Observable<Out> {
    return createOptions$.pipe(
      map(func),
      distinctUntilChanged(),
    );
  }

  const { coinMarketCap: coinMarketCapApiKey, googleAnalyticsTag } = environment.apiKeys;

  const rootLoader$ = createRootLoader$({
    db$: createFromEnvironment$({
      options$: mapDistinct$((_) => _.options.db),
    }),

    options$: mapDistinct$((_) => _.options.rootLoader),
  }).pipe(
    publishReplay(1),
    refCount(),
  );

  const queryMapEnv =
    environment.queryMap === undefined
      ? {
          queriesPath: resolveRootPath(
            path.join('packages', 'neotracker-server-graphql', 'src', '__generated__', 'queries.json'),
          ),
          nextQueriesDir: resolveRootPath(
            path.join('packages', 'neotracker-server-graphql', 'src', '__generated__', 'queries'),
          ),
        }
      : environment.queryMap;

  const queryMap$ = mapDistinct$((_) => _.options.serveNext).pipe(
    map(
      (next) =>
        new QueryMap({
          next,
          queriesPath: queryMapEnv.queriesPath,
          nextQueriesDir: queryMapEnv.nextQueriesDir,
        }),
    ),
  );

  const rootCalls$ = startRootCalls$(
    combineLatest([mapDistinct$((_) => _.options.appOptions), rootLoader$]).pipe(
      map(([appOptions, rootLoader]) => ({
        appOptions,
        rootLoader,
        coinMarketCapApiKey,
      })),
    ),
  );

  const subscriber$ = mapDistinct$((_) => _.options.subscribeProcessedNextIndex).pipe(
    switchMap((options) =>
      subscribeProcessedNextIndex({
        options,
      }),
    ),
  );

  const graphqlMiddleware = graphql({ next: false });
  const graphqlNextMiddleware = graphql({ next: true });

  const app$ = combineLatest([
    combineLatest([
      combineLatest([rootLoader$, queryMap$]).pipe(
        map(([rootLoader, queryMap]) => setRootLoader({ rootLoader, queryMap })),
      ),
      mapDistinct$((_) => _.options.appOptions.maintenance).pipe(
        map((maintenance) => healthCheck({ options: { maintenance } })),
      ),
      mapDistinct$((_) => _.options.toobusy).pipe(map((options) => toobusy({ options }))),
      mapDistinct$((_) => _.options.rateLimit).pipe(map((options) => ratelimit({ options }))),
      mapDistinct$((_) => _.options.security).pipe(map((options) => security({ options }))),
      mapDistinct$((_) => _.options.clientAssets).pipe(map((options) => clientAssets({ options }))),
    ]),
    combineLatest([
      mapDistinct$((_) => _.options.clientAssetsNext).pipe(map((options) => clientAssetsNext({ options }))),
      mapDistinct$((_) => _.options.publicAssets).pipe(map((options) => publicAssets({ options }))),
      mapDistinct$((_) => _.options.rootAssets).pipe(map((options) => rootAssets({ options }))),
      mapDistinct$((_) => _.options.domain).pipe(map((domain) => sitemap({ domain }))),
      mapDistinct$((_) => _.options.rpcURL).pipe(map((rpcURL) => nodeRPC({ rpcURL }))),
      mapDistinct$((_) => _.options.reportURL).pipe(map((reportURL) => report({ reportURL }))),
    ]),
    combineLatest([
      combineLatest([
        mapDistinct$(({ addHeadElements = noOpAddHeadElements }) => addHeadElements),
        mapDistinct$(({ addBodyElements = noOpAddBodyElements }) => addBodyElements),
        mapDistinct$((_) => _.options.react),
        mapDistinct$((_) => _.options.reactApp),
        mapDistinct$((_) => _.options.appOptions),
        mapDistinct$((_) => _.options.serveNext),
      ]).pipe(
        map(([addHeadElements, addBodyElements, react, reactAppOptions, appOptions, serveNext]) =>
          serveNext
            ? reactApp({
                addHeadElements,
                addBodyElements,
                googleAnalyticsTag,
                environment: environment.reactApp,
                options: reactAppOptions,
                network: environment.network,
                appOptions,
              })
            : reactApplication({
                addHeadElements,
                addBodyElements,
                googleAnalyticsTag,
                environment: environment.react,
                options: react,
                network: environment.network,
                appOptions,
              }),
        ),
      ),
      mapDistinct$(({ addMiddleware = noOpAddMiddleware }) => addMiddleware),
      defer(async () => LoadableExport.preloadAll()),
    ]),
  ]).pipe(
    map(
      ([
        [
          setRootLoaderMiddleware,
          healthCheckMiddleware,
          toobusyMiddleware,
          ratelimitMiddleware,
          securityMiddleware,
          clientAssetsMiddleware,
        ],
        [
          clientAssetsNextMiddleware,
          publicAssetsMiddleware,
          rootAssetsMiddleware,
          sitemapMiddleware,
          nodeRPCMiddleware,
          reportMiddleware,
        ],
        [reactApplicationMiddleware, addMiddleware],
      ]) => {
        const app = new Application();
        app.proxy = true;
        // $FlowFixMe
        app.silent = true;

        app.on('error', createOnError());

        // tslint:disable-next-line no-any
        const middlewares = (addMiddleware as any)([
          context({
            handleError: (ctx, error) => {
              if (error.status === RATE_LIMIT_ERROR_CODE) {
                throw error;
              }

              if (ctx.path === routes.ERROR) {
                ctx.throw(error.status != undefined ? error.status : 500, sanitizeError(error).clientMessage);
              } else if (ctx.request.method === 'GET' && !ctx.response.headerSent) {
                ctx.redirect(routes.ERROR);
              } else {
                throw error;
              }
            },
          }),
          setRootLoaderMiddleware,
          healthCheckMiddleware,
          toobusyMiddleware,
          ratelimitMiddleware,
          securityMiddleware,
          redirectMiddleware,
          clientAssetsMiddleware,
          clientAssetsNextMiddleware,
          publicAssetsMiddleware,
          rootAssetsMiddleware,
          sitemapMiddleware,
          graphqlMiddleware,
          graphqlNextMiddleware,
          nodeRPCMiddleware,
          reportMiddleware,
          reactApplicationMiddleware,
        ]);

        routeMiddleware({ app, middlewares, cors });

        return app;
      },
    ),
  );

  const server$ = app$.pipe(
    mergeScanLatest<Application, HandleServerResult<http.Server>>(
      (prevResult, app) =>
        defer(async () =>
          handleServer({
            createServer: () => http.createServer(),
            options: environment.server,
            app,
            prevResult,
          }),
        ),
      undefined,
    ),
    finalize(finalizeServer),
    filter(utils.notNull),
    map(({ server }) => server),
    filter(utils.notNull),
    distinctUntilChanged(),
  );

  const liveServer$ = combineLatest([server$, queryMap$]).pipe(
    mergeScanLatest<[http.Server | https.Server, QueryMap], LiveServer>(
      (prevLiveServer, [server, queryMap]) =>
        defer(async () => {
          if (prevLiveServer !== undefined) {
            await prevLiveServer.stop();
          }
          const graphqlServer = await LiveServer.create({
            schema: schema(),
            rootLoader$,
            labels: {},
            queryMap,
            socketOptions: {
              server,
              path: queryMap.next ? nextRoutes.GRAPHQL : routes.GRAPHQL,
            },
          });
          await graphqlServer.start();

          return graphqlServer;
        }),
      undefined,
    ),
    finalize(async (liveServer) => {
      if (liveServer !== undefined) {
        await liveServer.stop();
      }
    }),
  );

  return merge(rootCalls$, subscriber$, liveServer$);
};
