/* @flow */
import {
  GRAPHQL_WS,
  type ClientMessage,
  type ExecutionResult,
  parseAndValidateServerMessage,
} from 'neotracker-shared-graphql';
import * as Backoff from 'backo2';
import { type Monitor, type Span, metrics } from '@neo-one/monitor';
import { type Observer, Observable } from 'rxjs';

import _ from 'lodash';
import { labels, sanitizeError } from 'neotracker-shared-utils';

type Request = {|
  id: string,
  variables: Object,
|};

type OperationOptions = {|
  id: string,
  variables: Object,
  observer: Observer<ExecutionResult>,
|};

type Operation = {|
  ...OperationOptions,
  started: boolean,
  span?: Span,
|};

const WEBSOCKET_CLIENT_FIRST_RESPONSE_DURATION_SECONDS = metrics.createHistogram(
  {
    name: 'graphql_client_first_response_duration_seconds',
    labelNames: [labels.GRAPHQL_QUERY],
  },
);
const WEBSOCKET_CLIENT_FIRST_RESPONSE_FAILURES_TOTAL = metrics.createCounter({
  name: 'graphql_client_first_response_failures_total',
  labelNames: [labels.GRAPHQL_QUERY],
});

export default class LiveClient {
  endpoint: string;
  monitor: Monitor;
  operations: { [id: string]: Operation };
  nextOperationID: number;
  WSImpl: Class<WebSocket>;
  client: ?WebSocket;
  closedByUser: boolean;
  tryReconnectTimeoutID: ?TimeoutID;
  reconnecting: boolean;
  backoff: Backoff;
  activeListener: ?() => void;
  inactiveListener: ?() => void;

  constructor({ endpoint, monitor }: { endpoint: string, monitor: Monitor }) {
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
    this.operations = {};
    this.nextOperationID = 0;
    this.client = null;
    this.closedByUser = false;
    this.tryReconnectTimeoutID = null;
    this.reconnecting = false;
    this.backoff = new Backoff({ jitter: 0.5 });

    this.WSImpl = window.WebSocket || window.MozWebSocket;
    if (this.WSImpl == null) {
      throw new Error('SubscriptionClient requires Websocket support.');
    }
  }

  connect() {
    this.closedByUser = false;
    if (this.client != null) {
      return;
    }

    let client;
    try {
      client = this.monitor.captureLog(
        () => new this.WSImpl(this.endpoint, [GRAPHQL_WS]),
        { name: 'websocket_client_create_websocket', error: {} },
      );
    } catch (error) {
      if (!this.closedByUser) {
        this.tryReconnect();
      }
      return;
    }
    this.client = client;

    client.onopen = () => {
      this.monitor.log({ name: 'websocket_client_socket_open' });

      this.sendMessage({ type: 'GQL_CONNECTION_INIT' });
      Object.keys(this.operations).forEach(id => this.start(id));
    };

    client.onclose = event => {
      this.monitor
        .withLabels({
          [labels.WEBSOCKET_CLOSE_CODE]: event.code,
          [labels.WEBSOCKET_CLOSE_REASON]: event.reason,
        })
        .log({ name: 'websocket_client_socket_closed' });
      this.operations = _.mapValues(this.operations, operation => ({
        id: operation.id,
        variables: operation.variables,
        observer: operation.observer,
        started: false,
      }));
      this.client = null;
      if (!this.closedByUser) {
        this.tryReconnect();
      }
    };

    client.onerror = () => {
      this.monitor.log({ name: 'websocket_client_socket_error' });
    };

    client.onmessage = ({ data }: { data: any }) => {
      this.processReceivedData(data);
    };
  }

  close({
    code,
    reason,
    closedByUser: closedByUserIn,
  }: {
    code?: number,
    reason?: string,
    closedByUser?: boolean,
  }): void {
    // eslint-disable-next-line
    const client = this.client;
    if (client != null) {
      this.closedByUser = closedByUserIn == null ? true : closedByUserIn;

      this.clearTryReconnectTimeout();
      this.sendMessage({
        type: 'GQL_CONNECTION_TERMINATE',
      });

      client.close(code, reason);
      this.client = null;
    }
  }

  tryReconnect() {
    this.monitor.log({ name: 'websocket_client_socket_reconnect' });
    this.reconnecting = true;
    this.clearTryReconnectTimeout();
    this.tryReconnectTimeoutID = setTimeout(() => {
      if (Object.keys(this.operations).length > 0) {
        this.connect();
      }
    }, this.backoff.duration());
  }

  clearTryReconnectTimeout() {
    if (this.tryReconnectTimeoutID) {
      clearTimeout(this.tryReconnectTimeoutID);
      this.tryReconnectTimeoutID = null;
    }
  }

  get status(): number {
    if (this.client == null) {
      return this.WSImpl.CLOSED;
    }

    return this.client.readyState;
  }

  request(request: Request, monitor: Monitor): Observable<ExecutionResult> {
    this.connect();
    return Observable.create(observer => {
      let id = this.executeOperation(
        {
          id: request.id,
          variables: request.variables,
          observer,
        },
        monitor,
      );

      return {
        unsubscribe: () => {
          if (id != null) {
            this.unsubscribe(id);
            id = null;
          }
        },
      };
    });
  }

  executeOperation = (
    operation: OperationOptions,
    monitor: Monitor,
  ): string => {
    const id = this.generateOperationID();
    this.operations[id] = {
      id: operation.id,
      variables: operation.variables,
      observer: operation.observer,
      started: false,
    };
    this.start(id, monitor);

    return id;
  };

  start(id: string, monitor?: Monitor): void {
    const operation = this.operations[id];
    if (operation != null && this.status === this.WSImpl.OPEN) {
      const span = (monitor || this.monitor)
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
      this.operations[id] = {
        id: operation.id,
        variables: operation.variables,
        observer: operation.observer,
        started: true,
        span,
      };
      const headers = {};
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

  generateOperationID(): string {
    const next = String(this.nextOperationID);
    this.nextOperationID += 1;
    return next;
  }

  unsubscribe(id: string): void {
    if (this.operations[id]) {
      if (this.operations[id].started) {
        this.sendMessage({
          type: 'GQL_STOP',
          id,
        });
      }
      delete this.operations[id];
    }
  }

  unsubscribeAll(): void {
    Object.keys(this.operations).forEach(id => {
      this.unsubscribe(id);
    });
  }

  sendMessage(
    message: ClientMessage,
    observer?: Observer<ExecutionResult>,
    isRetry?: boolean,
    monitor?: Monitor,
  ): void {
    // eslint-disable-next-line
    const client = this.client;
    if (client != null && client.readyState === this.WSImpl.OPEN) {
      try {
        (monitor || this.monitor)
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
          if (observer != null) {
            this._reportError(observer, error);
          }
        } else {
          this.sendMessage(message, observer, true, monitor);
        }
      }
    }
  }

  processReceivedData(messageJSON: any) {
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
      if (this.operations[id]) {
        const operation = this.operations[id];
        if (operation.span != null) {
          operation.span.end(true);
          this.operations[id] = {
            id: operation.id,
            variables: operation.variables,
            observer: operation.observer,
            started: operation.started,
          };
        }
        this._reportError(this.operations[id].observer, new Error(msg));
        if (del) {
          delete this.operations[id];
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
        this.reconnecting = false;
        this.backoff.reset();
        break;
      case 'GQL_QUERY_MAP_ERROR':
        handleError(message.id, message.message);
        break;
      case 'GQL_DATA':
        if (this.operations[message.id]) {
          const operation = this.operations[message.id];
          if (operation.span != null) {
            operation.span.end();
            this.operations[message.id] = {
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
        // eslint-disable-next-line
        (message.type: empty);
        throw new Error('Invalid message type!');
    }
  }

  _reportError(observer: Observer<ExecutionResult>, error: Error): void {
    observer.next({
      errors: [{ message: sanitizeError(error).clientMessage }],
    });
  }
}
