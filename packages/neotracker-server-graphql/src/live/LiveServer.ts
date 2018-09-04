import { metrics, Monitor, Span } from '@neo-one/monitor';
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
import { labels, mergeScanLatest, sanitizeError, ua, utils } from '@neotracker/shared-utils';
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
  readonly closeSocket: (() => void);
  readonly restart: (() => Promise<void>);
}

const graphqlQuerylabelNames: ReadonlyArray<string> = [labels.GRAPHQL_QUERY];
const GRAPHQL_FIRST_RESPONSE_DURATION_SECONDS = metrics.createHistogram({
  name: 'graphql_server_first_response_duration_seconds',
  labelNames: graphqlQuerylabelNames,
});

const GRAPHQL_FIRST_RESPONSE_FAILURES_TOTAL = metrics.createCounter({
  name: 'graphql_server_first_response_failures_total',
  labelNames: graphqlQuerylabelNames,
});

const WEBSOCKET_SERVER_SOCKETS = metrics.createGauge({
  name: 'websocket_server_sockets',
});

export class LiveServer {
  public static async create({
    schema,
    rootLoader$,
    monitor: monitorIn,
    socketOptions = {},
    queryMap,
  }: {
    readonly schema: GraphQLSchema;
    readonly rootLoader$: Observable<RootLoader>;
    readonly monitor: Monitor;
    // tslint:disable-next-line no-any
    readonly socketOptions?: any;
    readonly queryMap: QueryMap;
  }): Promise<LiveServer> {
    const monitor = monitorIn.at('live_server').withLabels({
      [monitorIn.labels.SPAN_KIND]: 'server',
      [monitorIn.labels.PEER_SERVICE]: 'graphql',
    });

    const handleProtocols = (protocols: string[]) => {
      if (protocols.indexOf(GRAPHQL_WS) === -1) {
        monitor
          .withData({
            [labels.WEBSOCKET_PROTOCOLS]: JSON.stringify(protocols),
          })
          .logError({
            name: 'websocket_server_bad_protocol_error',
            error: new Error('Bad protocol'),
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
      monitor,
      wsServer,
      queryMap,
    });
  }

  public readonly schema: GraphQLSchema;
  public mutableRootLoader: RootLoader;
  public readonly rootLoader$: Observable<RootLoader>;
  public readonly monitor: Monitor;
  public readonly wsServer: ws.Server;
  public readonly mutableSockets: { [K in string]?: SocketConfig };
  public mutableSubscription: Subscription | undefined;
  private readonly queryMap: QueryMap;

  public constructor({
    schema,
    rootLoader,
    rootLoader$,
    monitor,
    wsServer,
    queryMap,
  }: {
    readonly schema: GraphQLSchema;
    readonly rootLoader: RootLoader;
    readonly rootLoader$: Observable<RootLoader>;
    readonly monitor: Monitor;
    readonly wsServer: ws.Server;
    readonly queryMap: QueryMap;
  }) {
    this.schema = schema;
    this.mutableRootLoader = rootLoader;
    this.rootLoader$ = rootLoader$;
    this.monitor = monitor.at('live_server');
    this.wsServer = wsServer;
    this.mutableSockets = {};
    this.queryMap = queryMap;
  }

  public async start(): Promise<void> {
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
    const monitor = this.monitor
      .forMessage(request)
      .withLabels(ua.convertLabels(getUA(request.headers['user-agent']).userAgent));

    monitor.log({ name: 'websocket_server_connection', level: 'verbose' });

    const mutableOperations: {
      [K in string]?: {
        subscriptions: Subscription[];
        restart: (() => Promise<void>);
      }
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
      if (!tryClosed && !closed) {
        monitor
          .withLabels({
            [labels.WEBSOCKET_CLOSE_CODE]: exit,
            [labels.WEBSOCKET_CLOSE_REASON]: reason,
          })
          .captureLog(
            () => {
              socket.close(exit, reason);
              tryClosed = true;
            },
            {
              name: 'websocket_server_close_socket',
              level: 'verbose',
              error: {},
            },
          );
      }
    };

    const sendMessage = (message: ServerMessage, isRetry?: boolean) => {
      if (socket.readyState === ws.OPEN) {
        try {
          monitor
            .withLabels({
              [labels.WEBSOCKET_MESSAGE_TYPE]: message.type,
            })
            .captureLog(() => socket.send(JSON.stringify(message)), {
              name: 'websocket_server_socket_send',
              level: 'verbose',
              error: {},
            });
        } catch {
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

        monitor.logError({ name: 'websocket_server_socket_error', error });
      }

      closeSocket(1011);
    };

    const onSocketClosed = (exit?: number, reason?: string) => {
      monitor
        .withLabels({
          [labels.WEBSOCKET_CLOSE_CODE]: exit,
          [labels.WEBSOCKET_CLOSE_REASON]: reason,
        })
        .log({
          name: 'websocket_server_socket_closed',
          level: 'verbose',
        });

      unsubscribeAll();
      closed = true;
      if (this.mutableSockets[socketID] !== undefined) {
        // tslint:disable-next-line no-dynamic-delete
        delete this.mutableSockets[socketID];
        WEBSOCKET_SERVER_SOCKETS.dec();
      }
    };

    const handleStart = async (message: ClientStartMessage) => {
      const startMonitor = monitor
        .withLabels({
          [labels.GRAPHQL_QUERY]: message.query.id,
        })
        .withData({
          [labels.GRAPHQL_VARIABLES]: JSON.stringify(message.query.variables),
        });

      let span: Span | undefined = startMonitor.startSpan({
        name: 'graphql_server_first_response',
        // references: [
        //   monitor.childOf(monitor.extract(monitor.formats.HTTP, message.span)),
        // ],
        metric: {
          total: GRAPHQL_FIRST_RESPONSE_DURATION_SECONDS,
          error: GRAPHQL_FIRST_RESPONSE_FAILURES_TOTAL,
        },

        trace: true,
      });

      if (mutableOperations[message.id] !== undefined) {
        unsubscribe(message.id);
      }

      const { mutableRootLoader } = this;
      let query: DocumentNode;
      try {
        query = await span.captureLog(async () => this.queryMap.get(message.query.id), {
          name: 'graphql_get_query',
          level: 'verbose',
          error: {},
        });
      } catch (error) {
        sendMessage({
          type: 'GQL_QUERY_MAP_ERROR',
          message: sanitizeError(error).message,
          id: message.id,
        });

        return;
      }

      const graphQLContext = makeContext(mutableRootLoader, startMonitor, query, message.query.id, () => span);

      let liveQueries;
      try {
        liveQueries = await span.captureLog(
          async () =>
            getLiveQuery({
              schema: this.schema,
              document: query,
              contextValue: graphQLContext,
              variableValues: message.query.variables,
            }),
          { name: 'graphql_get_live_query', level: 'verbose', error: {} },
        );
      } catch (error) {
        sendMessage({
          type: 'GQL_SUBSCRIBE_ERROR',
          message: sanitizeError(error).message,
          id: message.id,
        });

        return;
      }

      const subscriptions = liveQueries.map(([name, liveQuery]) => {
        const queryMonitor = startMonitor.withLabels({
          [labels.GRAPHQL_LIVE_NAME]: name,
        });

        return liveQuery.subscribe({
          next: (value: ExecutionResult) => {
            queryMonitor.log({
              name: 'graphql_subscription_result',
              level: 'verbose',
              error: {},
            });

            if (span !== undefined) {
              span.end();
              span = undefined;
            }

            sendMessage({
              type: 'GQL_DATA',
              value,
              id: message.id,
            });
          },
          complete: () => {
            queryMonitor.log({
              name: 'graphql_subscription_complete',
              level: 'verbose',
            });

            if (span !== undefined) {
              span.end();
              span = undefined;
            }
          },
          error: (error: Error) => {
            queryMonitor.log({
              name: 'graphql_subscription_result',
              level: 'verbose',
              error: { error },
            });

            if (span !== undefined) {
              span.end(true);
              span = undefined;
            }

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
        monitor
          .withData({
            [labels.WEBSOCKET_MESSAGEJSON]: messageJSON,
          })
          .logError({
            name: 'websocket_server_client_message_parse_error',
            error,
          });

        sendMessage({
          type: 'GQL_INVALID_MESSAGE_ERROR',
          message: sanitizeError(error).message,
        });

        return;
      }

      monitor
        .withLabels({
          [labels.WEBSOCKET_MESSAGE_TYPE]: message.type,
        })
        .log({
          name: 'websocket_server_message_received',
          level: 'verbose',
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
    WEBSOCKET_SERVER_SOCKETS.inc();
    socket.on('error', onSocketError);
    socket.on('close', onSocketClosed);
    socket.on('message', onMessage);
  };
}
