/* @flow */
import {
  GRAPHQL_WS,
  type ClientMessage,
  type ClientStartMessage,
  type ExecutionResult,
  type ServerMessage,
  parseAndValidateClientMessage,
} from 'neotracker-shared-graphql';
import { type GraphQLSchema } from 'graphql';
import { type IncomingMessage } from 'http';
import { type Monitor, metrics } from '@neo-one/monitor';
import { type Observable } from 'rxjs/Observable';
import { type RootLoader } from 'neotracker-server-db';
import { type Subscription } from 'rxjs/Subscription';

import { labels, sanitizeError, ua, values } from 'neotracker-shared-utils';
import { getUA } from 'neotracker-server-utils';
import { take } from 'rxjs/operators';
import uuidV4 from 'uuid/v4';
import * as ws from 'ws';

import QueryMap from '../QueryMap';

import getLiveQuery from './getLiveQuery';
import makeContext from '../makeContext';

type SocketConfig = {|
  closeSocket: () => void,
  restart: () => void,
|};

const graphqlQuerylabelNames = [labels.GRAPHQL_QUERY];
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

export default class LiveServer {
  schema: GraphQLSchema;
  rootLoader: RootLoader;
  rootLoader$: Observable<RootLoader>;
  monitor: Monitor;
  wsServer: ws.Server;

  sockets: { [socketID: string]: SocketConfig };
  subscription: ?Subscription;

  static async create({
    schema,
    rootLoader$,
    monitor: monitorIn,
    socketOptions: socketOptionsIn,
  }: {
    schema: GraphQLSchema,
    rootLoader$: Observable<RootLoader>,
    monitor: Monitor,
    socketOptions?: Object,
  }): Promise<LiveServer> {
    const monitor = monitorIn.at('live_server').withLabels({
      [monitorIn.labels.SPAN_KIND]: 'server',
      [monitorIn.labels.PEER_SERVICE]: 'graphql',
    });
    const socketOptions = socketOptionsIn || {};
    const handleProtocols = (protocols: Array<string>) => {
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
    });
  }

  constructor({
    schema,
    rootLoader,
    rootLoader$,
    monitor,
    wsServer,
  }: {|
    schema: GraphQLSchema,
    rootLoader: RootLoader,
    rootLoader$: Observable<RootLoader>,
    monitor: Monitor,
    wsServer: ws.Server,
  |}) {
    this.schema = schema;
    this.rootLoader = rootLoader;
    this.rootLoader$ = rootLoader$;
    this.monitor = monitor.at('live_server');
    this.wsServer = wsServer;
    this.subscription = null;
    this.sockets = {};
  }

  async start(): Promise<void> {
    this.subscription = this.rootLoader$.subscribe({
      next: rootLoader => {
        if (this.rootLoader !== rootLoader) {
          this.rootLoader = rootLoader;
          this.restartAll();
        }
      },
    });

    this.wsServer.on('connection', this.handleConnection);
  }

  async stop(): Promise<void> {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.wsServer.removeListener('connection', this.handleConnection);
    await new Promise(resolve => this.wsServer.close(() => resolve()));
  }

  restartAll(): void {
    values(this.sockets).forEach(({ restart }) => restart());
  }

  handleConnection = (socket: any, request: IncomingMessage): void => {
    const monitor = this.monitor
      .forMessage(request)
      .withLabels(
        ua.convertLabels(getUA(request.headers['user-agent']).userAgent),
      );
    monitor.log({ name: 'websocket_server_connection', level: 'verbose' });

    const operations = ({}: {
      [key: string]: {|
        subscriptions: Array<Subscription>,
        restart: () => void,
      |},
    });
    const socketID = uuidV4();

    const unsubscribe = (id: string) => {
      if (operations[id] != null) {
        operations[id].subscriptions.forEach(subscription => {
          subscription.unsubscribe();
        });
        delete operations[id];
      }
    };

    const unsubscribeAll = () => {
      Object.keys(operations).forEach(id => unsubscribe(id));
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
        } catch (error) {
          if (!isRetry) {
            sendMessage(message, true);
          }
        }
      }
    };

    const onSocketError = (error: Error) => {
      if ((error: $FlowFixMe).code !== 'EPIPE') {
        sendMessage({
          type: 'GQL_SOCKET_ERROR',
          message: sanitizeError(error).message,
        });
      }

      monitor.logError({ name: 'websocket_server_socket_error', error });

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
      if (this.sockets[socketID] != null) {
        delete this.sockets[socketID];
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
      let span = startMonitor.startSpan({
        name: 'graphql_server_first_response',
        // TODO: Add this back in once we have client traces
        // references: [
        //   monitor.childOf(monitor.extract(monitor.formats.HTTP, message.span)),
        // ],
        metric: {
          total: GRAPHQL_FIRST_RESPONSE_DURATION_SECONDS,
          error: GRAPHQL_FIRST_RESPONSE_FAILURES_TOTAL,
        },
        trace: true,
      });
      if (operations[message.id] != null) {
        unsubscribe(message.id);
      }

      const { rootLoader } = this;
      const queryMap = new QueryMap();

      let query;
      try {
        query = await span.captureLog(() => queryMap.get(message.query.id), {
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

      const graphQLContext = makeContext(
        rootLoader,
        startMonitor,
        query,
        message.query.id,
        () => span,
      );

      let liveQueries;
      try {
        liveQueries = await span.captureLog(
          () =>
            getLiveQuery(
              this.schema,
              query,
              null,
              graphQLContext,
              message.query.variables,
            ),
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
            if (span != null) {
              span.end();
              span = null;
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
            if (span != null) {
              span.end();
              span = null;
            }
          },
          error: (error: Error) => {
            queryMonitor.log({
              name: 'graphql_subscription_result',
              level: 'verbose',
              error: { error },
            });
            if (span != null) {
              span.end(true);
              span = null;
            }

            sendMessage({
              type: 'GQL_DATA_ERROR',
              message: sanitizeError(error).message,
              id: message.id,
            });
            handleStart(message);
          },
        });
      });
      operations[message.id] = {
        subscriptions,
        restart: () => {
          handleStart(message);
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
          // eslint-disable-next-line
          (message.type: empty);
          break;
      }
    };

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

      handleMessage(message);
    };

    const restartAll = () => {
      values(operations).map(({ restart }) => restart());
    };

    this.sockets[socketID] = { closeSocket, restart: restartAll };
    WEBSOCKET_SERVER_SOCKETS.inc();
    socket.on('error', onSocketError);
    socket.on('close', onSocketClosed);
    socket.on('message', onMessage);
  };
}
