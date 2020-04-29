import { AggregationType, globalStats, MeasureUnit } from '@neo-one/client-switch';
import { Labels, labelsToTags } from '@neo-one/utils';
import { createChild, serverLogger } from '@neotracker/logger';
import { RootLoader } from '@neotracker/server-db';
import { getUA } from '@neotracker/server-utils';
import {
  ClientMessage,
  ClientStartMessage,
  ExecutionResult,
  GRAPHQL_WS,
  parseAndValidateClientMessage,
  ServerMessage,
} from '@neotracker/shared-graphql';
import { labels as utilLabels, mergeScanLatest, sanitizeError, ua, utils } from '@neotracker/shared-utils';
import { DocumentNode, GraphQLSchema } from 'graphql';
import { IncomingMessage } from 'http';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import v4 from 'uuid/v4';
import * as ws from 'ws';
import { makeContext } from '../makeContext';
import { QueryMap } from '../QueryMap';
import { getLiveQuery } from './getLiveQuery';

interface SocketConfig {
  readonly closeSocket: () => void;
  readonly restart: () => Promise<void>;
}

const graphqlQuerylabelNames: ReadonlyArray<string> = [utilLabels.GRAPHQL_QUERY];

const requestSec = globalStats.createMeasureInt64('requests/duration', MeasureUnit.SEC);
const requestErrors = globalStats.createMeasureInt64('request/failures', MeasureUnit.UNIT);
const wsMeasure = globalStats.createMeasureInt64('ws_server/sockets', MeasureUnit.UNIT);

const GRAPHQL_FIRST_RESPONSE_DURATION_SECONDS = globalStats.createView(
  'graphql_server_first_response_duration_seconds',
  requestSec,
  AggregationType.DISTRIBUTION,
  labelsToTags(graphqlQuerylabelNames),
  'distribution of the seconds to first graphql response',
  [1, 2, 5, 7.5, 10, 12.5, 15, 17.5, 20],
);
globalStats.registerView(GRAPHQL_FIRST_RESPONSE_DURATION_SECONDS);

const GRAPHQL_FIRST_RESPONSE_FAILURES_TOTAL = globalStats.createView(
  'graphql_server_first_response_failures_total',
  requestErrors,
  AggregationType.COUNT,
  labelsToTags(graphqlQuerylabelNames),
  'total gql query failures',
);
globalStats.registerView(GRAPHQL_FIRST_RESPONSE_FAILURES_TOTAL);

const WEBSOCKET_SERVER_SOCKETS = globalStats.createView(
  'websocket_server_sockets',
  wsMeasure,
  AggregationType.COUNT,
  [],
  'total websocket server sockets open',
);
globalStats.registerView(WEBSOCKET_SERVER_SOCKETS);

const serverGQLLogger = createChild(serverLogger, { component: 'graphql' });

export class LiveServer {
  public static async create({
    schema,
    rootLoader$,
    labels: labelsIn = {},
    socketOptions = {},
    queryMap,
  }: {
    readonly schema: GraphQLSchema;
    readonly rootLoader$: Observable<RootLoader>;
    readonly labels: Record<string, string>;
    // tslint:disable-next-line no-any
    readonly socketOptions?: any;
    readonly queryMap: QueryMap;
  }): Promise<LiveServer> {
    const commonLabels = {
      [Labels.SPAN_KIND]: 'server',
      [Labels.PEER_SERVICE]: 'graphql',
      ...labelsIn,
    };

    const handleProtocols = (protocols: string[]) => {
      if (protocols.indexOf(GRAPHQL_WS) === -1) {
        serverGQLLogger.error({
          ...commonLabels,
          title: 'websocket_server_bad_protocol_error',
          [utilLabels.WEBSOCKET_PROTOCOLS]: JSON.stringify(protocols),
          error: 'Bad protocol',
        });

        return false;
      }

      return GRAPHQL_WS;
    };

    const wsServer = new ws.Server({
      handleProtocols,
      ...socketOptions,
    });

    const rootLoader = await rootLoader$.pipe(take(1)).toPromise();

    return new LiveServer({
      schema,
      rootLoader,
      rootLoader$,
      labels: commonLabels,
      wsServer,
      queryMap,
    });
  }

  public readonly schema: GraphQLSchema;
  public mutableRootLoader: RootLoader;
  public readonly rootLoader$: Observable<RootLoader>;
  public readonly labels: Record<string, string>;
  public readonly wsServer: ws.Server;
  public readonly mutableSockets: { [K in string]?: SocketConfig };
  public mutableSubscription: Subscription | undefined;
  private readonly queryMap: QueryMap;

  public constructor({
    schema,
    rootLoader,
    rootLoader$,
    labels,
    wsServer,
    queryMap,
  }: {
    readonly schema: GraphQLSchema;
    readonly rootLoader: RootLoader;
    readonly rootLoader$: Observable<RootLoader>;
    readonly labels: Record<string, string>;
    readonly wsServer: ws.Server;
    readonly queryMap: QueryMap;
  }) {
    this.schema = schema;
    this.mutableRootLoader = rootLoader;
    this.rootLoader$ = rootLoader$;
    this.labels = labels;
    this.wsServer = wsServer;
    this.mutableSockets = {};
    this.queryMap = queryMap;
  }

  public async start(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.mutableSubscription = this.rootLoader$
        .pipe(
          mergeScanLatest<RootLoader, undefined>(async (_prev, rootLoader) => {
            if (this.mutableRootLoader !== rootLoader) {
              this.mutableRootLoader = rootLoader;
              await this.restartAll();
            }

            return undefined;
          }, undefined),
        )
        .subscribe();

      this.wsServer.on('connection', this.handleConnection);
      resolve();
    });
  }

  public async stop(): Promise<void> {
    if (this.mutableSubscription !== undefined) {
      this.mutableSubscription.unsubscribe();
      this.mutableSubscription = undefined;
    }

    this.wsServer.removeListener('connection', this.handleConnection);
    await new Promise<void>((resolve) =>
      this.wsServer.close(() => {
        resolve();
      }),
    );
  }

  public async restartAll(): Promise<void> {
    await Promise.all(
      Object.values(this.mutableSockets).map(async (config) => {
        if (config !== undefined) {
          await config.restart();
        }
      }),
    );
  }

  public readonly handleConnection = (socket: ws, request: IncomingMessage): void => {
    const handleConnectionLabels = {
      ...this.labels,
      title: 'websocket_server_connection',
      ...ua.convertLabels(getUA(request.headers['user-agent']).userAgent),
      [Labels.HTTP_METHOD]: request.method,
      [Labels.SPAN_KIND]: 'server',
      [Labels.HTTP_HEADERS]: JSON.stringify(request.headers),
      [Labels.HTTP_URL]: request.url,
      [Labels.PEER_PORT]: request.socket.remotePort,
    };

    serverGQLLogger.info({ ...handleConnectionLabels });

    const mutableOperations: {
      [K in string]?: {
        subscriptions: Subscription[];
        restart: () => Promise<void>;
      };
    } = {};

    const socketID = v4();

    const unsubscribe = (id: string) => {
      const op = mutableOperations[id];
      if (op !== undefined) {
        op.subscriptions.forEach((subscription) => {
          subscription.unsubscribe();
        });
        // tslint:disable-next-line no-dynamic-delete
        delete mutableOperations[id];
      }
    };

    const unsubscribeAll = () => {
      Object.keys(mutableOperations).forEach(unsubscribe);
    };

    let tryClosed = false;
    let closed = false;
    const closeSocket = (exit?: number, reason?: string) => {
      const closeSocketLabels = {
        ...handleConnectionLabels,
        title: 'websocket_server_close_socket',
        [utilLabels.WEBSOCKET_CLOSE_CODE]: exit,
        [utilLabels.WEBSOCKET_CLOSE_REASON]: reason,
      };
      if (!tryClosed && !closed) {
        try {
          serverGQLLogger.info({ ...closeSocketLabels });
          socket.close(exit, reason);
          tryClosed = true;
        } catch (error) {
          serverGQLLogger.error({ ...closeSocketLabels, error: error.message });
        }
      }
    };

    const sendMessage = (message: ServerMessage, isRetry?: boolean) => {
      if (socket.readyState === ws.OPEN) {
        const sendMessageLabels = {
          ...handleConnectionLabels,
          title: 'websocket_server_socket_send',
          [utilLabels.WEBSOCKET_MESSAGE_TYPE]: message.type,
        };
        try {
          serverGQLLogger.info({ ...sendMessageLabels });
          socket.send(JSON.stringify(message));
        } catch (error) {
          serverGQLLogger.error({ ...sendMessageLabels, error: error.message });
          if (!isRetry) {
            sendMessage(message, true);
          }
        }
      }
    };

    const onSocketError = (error: NodeJS.ErrnoException) => {
      if (error.code !== 'EPIPE' && error.code !== 'ECONNRESET') {
        sendMessage({
          type: 'GQL_SOCKET_ERROR',
          message: sanitizeError(error).message,
        });
        serverGQLLogger.error({ title: 'websocket_server_socket_error', error: error.message });
      }

      closeSocket(1011);
    };

    const onSocketClosed = (exit?: number, reason?: string) => {
      serverGQLLogger.info({
        ...handleConnectionLabels,
        title: 'websocket_server_socket_closed',
        [utilLabels.WEBSOCKET_CLOSE_CODE]: exit,
        [utilLabels.WEBSOCKET_CLOSE_REASON]: reason,
      });
      unsubscribeAll();
      closed = true;
      if (this.mutableSockets[socketID] !== undefined) {
        // tslint:disable-next-line no-dynamic-delete
        delete this.mutableSockets[socketID];
        globalStats.record([
          {
            measure: wsMeasure,
            value: -1,
          },
        ]);
      }
    };

    const handleStart = async (message: ClientStartMessage) => {
      const startTime = Date.now();
      const handleStartLabels = {
        ...handleConnectionLabels,
        title: 'graphql_server_first_response',
        [utilLabels.GRAPHQL_VARIABLES]: JSON.stringify(message.query.variables),
        [utilLabels.GRAPHQL_QUERY]: message.query.id,
      };

      if (mutableOperations[message.id] !== undefined) {
        unsubscribe(message.id);
      }

      const { mutableRootLoader } = this;
      let query: DocumentNode;
      try {
        serverGQLLogger.info({ ...handleStartLabels, title: 'graphql_get_query' });
        query = await this.queryMap.get(message.query.id);
      } catch (error) {
        serverGQLLogger.error({ ...handleStartLabels, title: 'graphql_get_query', error: error.message });
        globalStats.record([
          {
            measure: requestErrors,
            value: 1,
          },
        ]);
        sendMessage({
          type: 'GQL_QUERY_MAP_ERROR',
          message: sanitizeError(error).message,
          id: message.id,
        });

        return;
      }

      const graphQLContext = makeContext(mutableRootLoader, query, message.query.id);

      let liveQueries;
      try {
        serverGQLLogger.info({ ...handleStartLabels, title: 'graphql_get_live_query' });
        liveQueries = await getLiveQuery({
          schema: this.schema,
          document: query,
          contextValue: graphQLContext,
          variableValues: message.query.variables,
        });
      } catch (error) {
        serverGQLLogger.error({ ...handleStartLabels, title: 'graphql_get_live_query', error: error.message });
        globalStats.record([
          {
            measure: requestErrors,
            value: 1,
          },
        ]);
        sendMessage({
          type: 'GQL_SUBSCRIBE_ERROR',
          message: sanitizeError(error).message,
          id: message.id,
        });

        return;
      }

      const subscriptions = liveQueries.map(([name, liveQuery]) => {
        const subscriptionLabels = {
          ...handleStartLabels,
          [utilLabels.GRAPHQL_LIVE_NAME]: name,
        };

        return liveQuery.subscribe({
          next: (value: ExecutionResult) => {
            serverGQLLogger.info({ ...subscriptionLabels, title: 'graphql_subscription_result' });
            globalStats.record([
              {
                measure: requestSec,
                value: Date.now() - startTime,
              },
            ]);
            sendMessage({
              type: 'GQL_DATA',
              value,
              id: message.id,
            });
          },
          complete: () => {
            serverGQLLogger.info({ ...subscriptionLabels, title: 'graphql_subscription_complete' });
            globalStats.record([
              {
                measure: requestSec,
                value: Date.now() - startTime,
              },
            ]);
          },
          error: (error: Error) => {
            serverGQLLogger.error({
              ...subscriptionLabels,
              title: 'graphql_subscription_result',
              error: error.message,
            });
            globalStats.record([
              {
                measure: requestErrors,
                value: 1,
              },
            ]);

            sendMessage({
              type: 'GQL_DATA_ERROR',
              message: sanitizeError(error).message,
              id: message.id,
            });

            // tslint:disable-next-line no-floating-promises
            handleStart(message);
          },
        });
      });
      mutableOperations[message.id] = {
        subscriptions,
        restart: async () => {
          await handleStart(message);
        },
      };
    };

    const handleMessage = async (message: ClientMessage) => {
      switch (message.type) {
        case 'GQL_CONNECTION_INIT':
          sendMessage({
            type: 'GQL_CONNECTION_ACK',
          });

          break;
        case 'GQL_CONNECTION_TERMINATE':
          closeSocket();
          break;
        case 'GQL_START':
          await handleStart(message);
          break;
        case 'GQL_STOP':
          unsubscribe(message.id);
          break;
        default:
          utils.assertNever(message);
      }
    };

    // tslint:disable-next-line no-any
    const onMessage = (messageJSON: any) => {
      let message;
      try {
        message = parseAndValidateClientMessage(messageJSON);
      } catch (error) {
        serverGQLLogger.error({
          ...handleConnectionLabels,
          title: 'websocket_server_client_message_parse_error',
          [utilLabels.WEBSOCKET_MESSAGEJSON]: messageJSON,
          error: error.message,
        });
        sendMessage({
          type: 'GQL_INVALID_MESSAGE_ERROR',
          message: sanitizeError(error).message,
        });

        return;
      }

      serverGQLLogger.info({
        ...handleConnectionLabels,
        title: 'websocket_server_message_received',
        [utilLabels.WEBSOCKET_MESSAGE_TYPE]: message.type,
        [utilLabels.WEBSOCKET_MESSAGEJSON]: messageJSON,
      });

      // tslint:disable-next-line no-floating-promises
      handleMessage(message);
    };

    const restartAll = async () => {
      await Promise.all(
        Object.values(mutableOperations).map(async (config) => {
          if (config !== undefined) {
            await config.restart();
          }
        }),
      );
    };

    this.mutableSockets[socketID] = { closeSocket, restart: restartAll };
    globalStats.record([
      {
        measure: wsMeasure,
        value: 1,
      },
    ]);
    socket.on('error', onSocketError);
    socket.on('close', onSocketClosed);
    socket.on('message', onMessage);
  };
}
