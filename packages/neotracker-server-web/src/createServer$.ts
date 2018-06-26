import { NetworkType } from '@neo-one/client';
import { Monitor } from '@neo-one/monitor';
import http from 'http';
import https from 'https';
import Application from 'koa';
import {
  createFromEnvironment$,
  createRootLoader$,
  DBEnvironment,
  DBOptions,
  RootLoaderOptions,
  subscribeProcessedNextIndex,
  SubscribeProcessedNextIndexEnvironment,
  SubscribeProcessedNextIndexOptions,
} from 'neotracker-server-db';
import { LiveServer, schema, startRootCalls$ } from 'neotracker-server-graphql';
import { finalizeServer, handleServer } from 'neotracker-server-utils';
import {
  context,
  onError as createOnError,
  routeMiddleware,
  ServerMiddleware,
  ServerRoute,
} from 'neotracker-server-utils-koa';
import { finalize, mergeScanLatest, sanitizeError, utils } from 'neotracker-shared-utils';
// @ts-ignore
import { AppOptions, routes } from 'neotracker-shared-web';
import { combineLatest, defer, merge, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, publishReplay, refCount, switchMap } from 'rxjs/operators';
import {
  AddBodyElements,
  AddHeadElements,
  clientAssets,
  cors,
  graphql,
  healthCheck,
  nodeRPC,
  publicAssets,
  ratelimit,
  RateLimitOptions,
  reactApplication,
  ReactEnvironment,
  ReactOptions,
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
  readonly keepAliveTimeoutMS: number;
}
export interface Environment {
  readonly react: ReactEnvironment;
  readonly db: DBEnvironment;
  readonly directDB: SubscribeProcessedNextIndexEnvironment;
  readonly server: HTTPServerEnvironment;
  readonly network: NetworkType;
}
export interface Options {
  readonly db: DBOptions;
  readonly rootLoader: RootLoaderOptions;
  readonly rateLimit: RateLimitOptions;
  readonly react: ReactOptions;
  readonly toobusy: TooBusyOptions;
  readonly security: SecurityOptions;
  readonly clientAssets: ServeAssetsOptions;
  readonly publicAssets: ServeAssetsOptions;
  readonly rootAssets: ServeAssetsOptions;
  readonly domain: string;
  readonly rpcURL: string;
  readonly reportURL?: string;
  readonly server: HTTPServerOptions;
  readonly appOptions: AppOptions;
  readonly subscribeProcessedNextIndex: SubscribeProcessedNextIndexOptions;
}
export type AddMiddleware = ((
  middleware: ReadonlyArray<ServerMiddleware | ServerRoute>,
) => ReadonlyArray<ServerMiddleware | ServerRoute>);
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
  monitor,
  environment,
  createOptions$,
}: {
  readonly monitor: Monitor;
  readonly environment: Environment;
  readonly createOptions$: Observable<ServerCreateOptions>;
}) => {
  function mapDistinct$<Out>(func: ((value: ServerCreateOptions) => Out)): Observable<Out> {
    return createOptions$.pipe(
      map(func),
      distinctUntilChanged(),
    );
  }

  const rootLoader$ = createRootLoader$({
    db$: createFromEnvironment$({
      monitor,
      environment: environment.db,
      options$: mapDistinct$((_) => _.options.db),
    }),

    options$: mapDistinct$((_) => _.options.rootLoader),
    monitor,
  }).pipe(
    publishReplay(1),
    refCount(),
  );

  const rootCalls$ = startRootCalls$(
    combineLatest(mapDistinct$((_) => _.options.appOptions), rootLoader$).pipe(
      map(([appOptions, rootLoader]) => ({ monitor, appOptions, rootLoader })),
    ),
  );

  const subscriber$ = mapDistinct$((_) => _.options.subscribeProcessedNextIndex).pipe(
    switchMap((options) =>
      subscribeProcessedNextIndex({
        monitor,
        options,
        environment: environment.directDB,
      }),
    ),
  );

  const graphqlMiddleware = graphql();

  const app$ = combineLatest(
    rootLoader$.pipe(map((rootLoader) => setRootLoader({ rootLoader }))),
    mapDistinct$((_) => _.options.appOptions.maintenance).pipe(
      map((maintenance) => healthCheck({ options: { maintenance } })),
    ),
    mapDistinct$((_) => _.options.toobusy).pipe(map((options) => toobusy({ options }))),
    mapDistinct$((_) => _.options.rateLimit).pipe(map((options) => ratelimit({ options }))),
    mapDistinct$((_) => _.options.security).pipe(map((options) => security({ options }))),
    mapDistinct$((_) => _.options.clientAssets).pipe(map((options) => clientAssets({ options }))),
    mapDistinct$((_) => _.options.publicAssets).pipe(map((options) => publicAssets({ options }))),
    mapDistinct$((_) => _.options.rootAssets).pipe(map((options) => rootAssets({ options }))),
    mapDistinct$((_) => _.options.domain).pipe(map((domain) => sitemap({ domain }))),
    mapDistinct$((_) => _.options.rpcURL).pipe(map((rpcURL) => nodeRPC({ rpcURL }))),
    mapDistinct$((_) => _.options.reportURL).pipe(map((reportURL) => report({ reportURL }))),
    combineLatest(
      mapDistinct$(({ addHeadElements = noOpAddHeadElements }) => addHeadElements),
      mapDistinct$(({ addBodyElements = noOpAddBodyElements }) => addBodyElements),
      mapDistinct$((_) => _.options.react),
      mapDistinct$((_) => _.options.appOptions),
    ).pipe(
      map(([addHeadElements, addBodyElements, react, appOptions]) =>
        reactApplication({
          monitor,
          addHeadElements,
          addBodyElements,
          environment: environment.react,
          options: react,
          network: environment.network,
          appOptions,
        }),
      ),
    ),
    mapDistinct$(({ addMiddleware = noOpAddMiddleware }) => addMiddleware),
  ).pipe(
    map(
      ([
        setRootLoaderMiddleware,
        healthCheckMiddleware,
        toobusyMiddleware,
        ratelimitMiddleware,
        securityMiddleware,
        clientAssetsMiddleware,
        publicAssetsMiddleware,
        rootAssetsMiddleware,
        sitemapMiddleware,
        nodeRPCMiddleware,
        reportMiddleware,
        reactApplicationMiddleware,
        addMiddleware,
      ]) => {
        const app = new Application();
        app.proxy = true;
        // $FlowFixMe
        app.silent = true;

        app.on('error', createOnError({ monitor }));

        // tslint:disable-next-line no-any
        const middlewares = (addMiddleware as any)([
          setRootLoaderMiddleware,
          context({
            monitor,
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
          healthCheckMiddleware,
          cors,
          toobusyMiddleware,
          ratelimitMiddleware,
          securityMiddleware,
          clientAssetsMiddleware,
          publicAssetsMiddleware,
          rootAssetsMiddleware,
          sitemapMiddleware,
          graphqlMiddleware,
          nodeRPCMiddleware,
          reportMiddleware,
          reactApplicationMiddleware,
        ]);

        routeMiddleware({ app, middlewares });

        return app;
      },
    ),
  );

  const server$ = app$.pipe(
    mergeScanLatest(
      (prevResult, app) =>
        defer(async () =>
          handleServer({
            monitor,
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
    mergeScanLatest<http.Server | https.Server, LiveServer>(
      (prevLiveServer, server) =>
        defer(async () => {
          if (prevLiveServer !== undefined) {
            await prevLiveServer.stop();
          }
          const liveServer = await LiveServer.create({
            schema,
            rootLoader$,
            monitor,
            socketOptions: {
              server,
              path: routes.GRAPHQL,
            },
          });

          await liveServer.start();

          return liveServer;
        }),
      undefined,
    ),
    finalize(async (liveServer) => {
      if (liveServer !== undefined) {
        await liveServer.stop();
      }
    }),
  );

  return merge(rootCalls$, subscriber$, server$);
};
