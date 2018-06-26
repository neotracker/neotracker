import { Carrier, metrics, Monitor, Span } from '@neo-one/monitor';
import Backoff from 'backo2';
import _ from 'lodash';
import { ClientMessage, ExecutionResult, GRAPHQL_WS, parseAndValidateServerMessage } from 'neotracker-shared-graphql';
import { labels, sanitizeError, utils } from 'neotracker-shared-utils';
import { Observable, Observer } from 'rxjs';

interface Request {
  readonly id: string;
  // tslint:disable-next-line no-any
  readonly variables: any;
}

interface OperationOptions {
  readonly id: string;
  // tslint:disable-next-line no-any
  readonly variables: any;
  readonly observer: Observer<ExecutionResult>;
}

interface Operation extends OperationOptions {
  readonly started: boolean;
  readonly span?: Span;
}

const WEBSOCKET_CLIENT_FIRST_RESPONSE_DURATION_SECONDS = metrics.createHistogram({
  name: 'graphql_client_first_response_duration_seconds',
  labelNames: [labels.GRAPHQL_QUERY],
});

const WEBSOCKET_CLIENT_FIRST_RESPONSE_FAILURES_TOTAL = metrics.createCounter({
  name: 'graphql_client_first_response_failures_total',
  labelNames: [labels.GRAPHQL_QUERY],
});

export class LiveClient {
  public readonly endpoint: string;
  public readonly monitor: Monitor;
  // tslint:disable-next-line readonly-keyword
  public mutableOperations: { [id: string]: Operation };
  public mutableNextOperationID: number;
  public readonly wsImpl: typeof WebSocket;
  public mutableClient: WebSocket | undefined;
  public mutableClosedByUser: boolean;
  public mutableTryReconnectTimeoutID: NodeJS.Timer | undefined;
  public mutableReconnecting: boolean;
  public readonly backoff: Backoff;
  public mutableActiveListener: (() => void) | undefined;
  public mutableInactiveListener: (() => void) | undefined;

  public constructor({ endpoint, monitor }: { readonly endpoint: string; readonly monitor: Monitor }) {
    this.endpoint = endpoint;
    this.monitor = monitor
      .at('live_client')
      .withLabels({
        [monitor.labels.SPAN_KIND]: 'client',
        [monitor.labels.PEER_SERVICE]: 'graphql',
      })
      .withData({
        [labels.WEBSOCKET_URL]: endpoint,
      });

    this.mutableOperations = {};
    this.mutableNextOperationID = 0;
    this.mutableClosedByUser = false;
    this.mutableReconnecting = false;
    this.backoff = new Backoff({ jitter: 0.5 });
    // @ts-ignore
    this.wsImpl = window.WebSocket || window.MozWebSocket;
    // tslint:disable-next-line strict-type-predicates
    if (this.wsImpl == undefined) {
      throw new Error('SubscriptionClient requires Websocket support.');
    }
  }

  public connect() {
    this.mutableClosedByUser = false;
    if (this.mutableClient !== undefined) {
      return;
    }

    let mutableClient;
    try {
      mutableClient = this.monitor.captureLog(() => new this.wsImpl(this.endpoint, [GRAPHQL_WS]), {
        name: 'websocket_client_create_websocket',
        error: {},
      });
    } catch {
      if (!this.mutableClosedByUser) {
        this.tryReconnect();
      }

      return;
    }
    this.mutableClient = mutableClient;

    mutableClient.onopen = () => {
      this.monitor.log({ name: 'websocket_client_socket_open' });

      this.sendMessage({ type: 'GQL_CONNECTION_INIT' });
      Object.keys(this.mutableOperations).forEach((id) => this.start(id));
    };

    mutableClient.onclose = (event) => {
      this.monitor
        .withLabels({
          [labels.WEBSOCKET_CLOSE_CODE]: event.code,
          [labels.WEBSOCKET_CLOSE_REASON]: event.reason,
        })
        .log({ name: 'websocket_client_socket_closed' });
      this.mutableOperations = _.mapValues(this.mutableOperations, (operation) => ({
        id: operation.id,
        variables: operation.variables,
        observer: operation.observer,
        started: false,
      }));

      this.mutableClient = undefined;
      if (!this.mutableClosedByUser) {
        this.tryReconnect();
      }
    };

    mutableClient.onerror = () => {
      this.monitor.log({ name: 'websocket_client_socket_error' });
    };

    // tslint:disable-next-line no-any
    mutableClient.onmessage = ({ data }: { data: any }) => {
      this.processReceivedData(data);
    };
  }

  public close({
    code,
    reason,
    mutableClosedByUser: mutableClosedByUserIn,
  }: {
    readonly code?: number;
    readonly reason?: string;
    readonly mutableClosedByUser?: boolean;
  }): void {
    // eslint-disable-next-line
    const client = this.mutableClient;
    if (client !== undefined) {
      this.mutableClosedByUser = mutableClosedByUserIn === undefined ? true : mutableClosedByUserIn;

      this.clearTryReconnectTimeout();
      this.sendMessage({
        type: 'GQL_CONNECTION_TERMINATE',
      });

      client.close(code, reason);
      this.mutableClient = undefined;
    }
  }

  public tryReconnect() {
    this.monitor.log({ name: 'websocket_client_socket_reconnect' });
    this.mutableReconnecting = true;
    this.clearTryReconnectTimeout();
    this.mutableTryReconnectTimeoutID = setTimeout(() => {
      if (Object.keys(this.mutableOperations).length > 0) {
        this.connect();
      }
    }, this.backoff.duration());
  }

  public clearTryReconnectTimeout() {
    if (this.mutableTryReconnectTimeoutID) {
      clearTimeout(this.mutableTryReconnectTimeoutID);
      this.mutableTryReconnectTimeoutID = undefined;
    }
  }

  public get status(): number {
    if (this.mutableClient === undefined) {
      return this.wsImpl.CLOSED;
    }

    return this.mutableClient.readyState;
  }

  public request$(request: Request, monitor: Monitor): Observable<ExecutionResult> {
    this.connect();

    return Observable.create((observer: Observer<ExecutionResult>) => {
      let id: string | undefined = this.executeOperation(
        {
          id: request.id,
          variables: request.variables,
          observer,
        },
        monitor,
      );

      return {
        unsubscribe: () => {
          if (id !== undefined) {
            this.unsubscribe(id);
            id = undefined;
          }
        },
      };
    });
  }

  public readonly executeOperation = (operation: OperationOptions, monitor: Monitor): string => {
    const id = this.generateOperationID();
    this.mutableOperations[id] = {
      id: operation.id,
      variables: operation.variables,
      observer: operation.observer,
      started: false,
    };

    this.start(id, monitor);

    return id;
  };

  public start(id: string, monitor: Monitor = this.monitor): void {
    const operation = this.mutableOperations[id] as Operation | undefined;
    if (operation !== undefined && this.status === this.wsImpl.OPEN) {
      const span = monitor
        .withLabels({
          [labels.GRAPHQL_QUERY]: operation.id,
        })
        .withData({
          [labels.GRAPHQL_VARIABLES]: JSON.stringify(operation.variables),
        })
        .startSpan({
          name: 'graphql_client_first_response',
          metric: {
            total: WEBSOCKET_CLIENT_FIRST_RESPONSE_DURATION_SECONDS,
            error: WEBSOCKET_CLIENT_FIRST_RESPONSE_FAILURES_TOTAL,
          },
        });

      this.mutableOperations[id] = {
        id: operation.id,
        variables: operation.variables,
        observer: operation.observer,
        started: true,
        span,
      };

      // tslint:disable-next-line no-object-literal-type-assertion
      const headers = {} as Carrier;
      span.inject(span.formats.HTTP, headers);
      this.sendMessage(
        {
          type: 'GQL_START',
          id,
          query: {
            id: operation.id,
            variables: operation.variables,
          },

          span: headers,
        },

        operation.observer,
        false,
        span,
      );
    }
  }

  public generateOperationID(): string {
    const next = String(this.mutableNextOperationID);
    this.mutableNextOperationID += 1;

    return next;
  }

  public unsubscribe(id: string): void {
    const operation = this.mutableOperations[id] as Operation | undefined;
    if (operation !== undefined) {
      if (operation.started) {
        this.sendMessage({
          type: 'GQL_STOP',
          id,
        });
      }
      // tslint:disable-next-line no-dynamic-delete
      delete this.mutableOperations[id];
    }
  }

  public unsubscribeAll(): void {
    Object.keys(this.mutableOperations).forEach((id) => {
      this.unsubscribe(id);
    });
  }

  public sendMessage(
    message: ClientMessage,
    observer?: Observer<ExecutionResult>,
    isRetry?: boolean,
    monitor: Monitor = this.monitor,
  ): void {
    // eslint-disable-next-line
    const client = this.mutableClient;
    if (client !== undefined && client.readyState === this.wsImpl.OPEN) {
      try {
        monitor
          .withLabels({
            [labels.WEBSOCKET_MESSAGE_TYPE]: message.type,
          })
          .captureLog(() => client.send(JSON.stringify(message)), {
            name: 'websocket_client_socket_send',
            error: {},
            level: 'verbose',
          });
      } catch (error) {
        if (isRetry) {
          if (observer !== undefined) {
            this.reportError(observer, error);
          }
        } else {
          this.sendMessage(message, observer, true, monitor);
        }
      }
    }
  }

  // tslint:disable-next-line no-any
  public processReceivedData(messageJSON: any) {
    let message;
    try {
      message = parseAndValidateServerMessage(messageJSON);
    } catch (error) {
      this.monitor
        .withData({
          [labels.WEBSOCKET_MESSAGEJSON]: messageJSON,
        })
        .logError({
          name: 'websocket_client_server_message_parse_error',
          error,
        });

      return;
    }

    this.monitor
      .withLabels({
        [labels.WEBSOCKET_MESSAGE_TYPE]: message.type,
      })
      .log({
        name: 'websocket_client_message_received',
        level: 'verbose',
      });

    const handleError = (id: string, msg: string, del?: boolean) => {
      const operation = this.mutableOperations[id] as Operation | undefined;
      if (operation !== undefined) {
        if (operation.span !== undefined) {
          operation.span.end(true);
          this.mutableOperations[id] = {
            id: operation.id,
            variables: operation.variables,
            observer: operation.observer,
            started: operation.started,
          };
        }
        this.reportError(this.mutableOperations[id].observer, new Error(msg));
        if (del) {
          // tslint:disable-next-line no-dynamic-delete
          delete this.mutableOperations[id];
        }
      }
    };

    switch (message.type) {
      case 'GQL_INVALID_MESSAGE_ERROR':
        break;
      case 'GQL_SEND_ERROR':
        break;
      case 'GQL_SOCKET_ERROR':
        break;
      case 'GQL_CONNECTION_ACK':
        this.mutableReconnecting = false;
        this.backoff.reset();
        break;
      case 'GQL_QUERY_MAP_ERROR':
        handleError(message.id, message.message);
        break;
      case 'GQL_DATA':
        if ((this.mutableOperations[message.id] as Operation | undefined) !== undefined) {
          const operation = this.mutableOperations[message.id];
          if (operation.span !== undefined) {
            operation.span.end();
            this.mutableOperations[message.id] = {
              id: operation.id,
              variables: operation.variables,
              observer: operation.observer,
              started: operation.started,
            };
          }
          operation.observer.next(message.value);
        }
        break;
      case 'GQL_DATA_ERROR':
        handleError(message.id, message.message);
        break;
      case 'GQL_SUBSCRIBE_ERROR':
        handleError(message.id, message.message);
        break;
      default:
        utils.assertNever(message);
        throw new Error('Invalid message type!');
    }
  }

  private reportError(observer: Observer<ExecutionResult>, error: Error): void {
    observer.next({
      errors: [{ message: sanitizeError(error).clientMessage }],
    });
  }
}
