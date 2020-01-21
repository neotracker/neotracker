import { AggregationType, globalStats, MeasureUnit } from '@neo-one/client-switch';
import { Labels, labelsToTags } from '@neo-one/utils';
import { clientLogger } from '@neotracker/logger';
import { ClientMessage, ExecutionResult, GRAPHQL_WS, parseAndValidateServerMessage } from '@neotracker/shared-graphql';
import { labels, sanitizeError, utils } from '@neotracker/shared-utils';
import Backoff from 'backo2';
import debug from 'debug';
import _ from 'lodash';
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
}

const requestSec = globalStats.createMeasureInt64('requests/duration', MeasureUnit.SEC);
const requestErrors = globalStats.createMeasureInt64('requests/failures', MeasureUnit.UNIT);

const WEBSOCKET_CLIENT_FIRST_RESPONSE_DURATION_SECONDS = globalStats.createView(
  'graphql_client_first_response_duration_seconds',
  requestSec,
  AggregationType.DISTRIBUTION,
  labelsToTags([labels.GRAPHQL_QUERY]),
  'distribution of first response duration',
  [1, 2, 5, 7.5, 10, 12.5, 15, 17.5, 20],
);
globalStats.registerView(WEBSOCKET_CLIENT_FIRST_RESPONSE_DURATION_SECONDS);

const WEBSOCKET_CLIENT_FIRST_RESPONSE_FAILURES_TOTAL = globalStats.createView(
  'graphql_client_first_response_failures_total',
  requestErrors,
  AggregationType.COUNT,
  labelsToTags([labels.GRAPHQL_QUERY]),
  'total first response failures',
);
globalStats.registerView(WEBSOCKET_CLIENT_FIRST_RESPONSE_FAILURES_TOTAL);

const logger = debug('NEOTRACKER:LiveClient');

export class LiveClient {
  public readonly endpoint: string;
  public readonly labels: Record<string, string>;
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

  public constructor({
    endpoint,
    labels: labelsIn,
  }: {
    readonly endpoint: string;
    readonly labels: Record<string, string>;
  }) {
    this.endpoint = endpoint;
    this.labels = {
      ...labelsIn,
      [Labels.SPAN_KIND]: 'client',
      [Labels.PEER_SERVICE]: 'graphql',
      [labels.WEBSOCKET_URL]: endpoint,
    };

    this.mutableOperations = {};
    this.mutableNextOperationID = 0;
    this.mutableClosedByUser = false;
    this.mutableReconnecting = false;
    this.backoff = new Backoff({ jitter: 0.5 });
    // @ts-ignore
    // tslint:disable-next-line strict-boolean-expressions
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
    const connectLabels = { ...this.labels, title: 'websocket_client_create_websocket' };
    try {
      clientLogger.info({ ...connectLabels });
      logger('%o', { level: 'debug', ...connectLabels });
      mutableClient = new this.wsImpl(this.endpoint, [GRAPHQL_WS]);
    } catch (error) {
      clientLogger.error({ ...connectLabels, error: error.message });
      logger('%o', { level: 'error', error: error.message, ...connectLabels });
      if (!this.mutableClosedByUser) {
        this.tryReconnect();
      }

      return;
    }
    this.mutableClient = mutableClient;

    mutableClient.onopen = () => {
      const onOpenLabels = { ...this.labels, title: 'websocket_client_socket_open' };
      clientLogger.info({ ...onOpenLabels });
      logger('%o', { level: 'debug', ...onOpenLabels });

      this.sendMessage({ type: 'GQL_CONNECTION_INIT' });
      Object.keys(this.mutableOperations).forEach((id) => this.start(id));
    };

    mutableClient.onclose = (event) => {
      const onCloseLabels = {
        ...this.labels,
        title: 'websocket_client_socket_closed',
        [labels.WEBSOCKET_CLOSE_CODE]: event.code,
        [labels.WEBSOCKET_CLOSE_REASON]: event.reason,
      };
      clientLogger.info({ ...onCloseLabels });
      logger('%o', { level: 'debug', ...onCloseLabels });
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
      const onErrorLabels = { ...this.labels, title: 'websocket_client_socket_error' };
      clientLogger.error({ ...onErrorLabels });
      logger('%o', { level: 'error', ...onErrorLabels });
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
    const tryReconnectLabels = { ...this.labels, title: 'websocket_client_socket_reconnect' };
    clientLogger.info({ ...tryReconnectLabels });
    logger('%o', { level: 'debug', ...tryReconnectLabels });
    this.mutableReconnecting = true;
    this.clearTryReconnectTimeout();
    this.mutableTryReconnectTimeoutID = setTimeout(() => {
      if (Object.keys(this.mutableOperations).length > 0) {
        this.connect();
      }
      // tslint:disable-next-line: no-any
    }, this.backoff.duration()) as any;
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

  public request$(request: Request): Observable<ExecutionResult> {
    this.connect();

    return new Observable((observer: Observer<ExecutionResult>) => {
      let id: string | undefined = this.executeOperation({
        id: request.id,
        variables: request.variables,
        observer,
      });

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

  public readonly executeOperation = (operation: OperationOptions): string => {
    const id = this.generateOperationID();
    this.mutableOperations[id] = {
      id: operation.id,
      variables: operation.variables,
      observer: operation.observer,
      started: false,
    };

    this.start(id);

    return id;
  };

  public start(id: string): void {
    const startTime = Date.now();
    const operation = this.mutableOperations[id] as Operation | undefined;
    if (operation !== undefined && this.status === this.wsImpl.OPEN) {
      const startLabels = {
        ...this.labels,
        title: 'graphql_client_first_response',
        [labels.GRAPHQL_QUERY]: operation.id,
        [labels.GRAPHQL_VARIABLES]: JSON.stringify(operation.variables),
      };
      clientLogger.info({ ...startLabels });
      logger('%o', { level: 'debug', ...startLabels });
      globalStats.record([
        {
          measure: requestSec,
          value: Date.now() - startTime,
        },
      ]);

      this.mutableOperations[id] = {
        id: operation.id,
        variables: operation.variables,
        observer: operation.observer,
        started: true,
      };

      this.sendMessage(
        {
          type: 'GQL_START',
          id,
          query: {
            id: operation.id,
            variables: operation.variables,
          },
        },
        operation.observer,
        false,
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

  public sendMessage(message: ClientMessage, observer?: Observer<ExecutionResult>, isRetry?: boolean): void {
    // eslint-disable-next-line
    const client = this.mutableClient;
    if (client !== undefined && client.readyState === this.wsImpl.OPEN) {
      const sendMessageLabels = {
        ...this.labels,
        title: 'websocket_client_socket_send',
        [labels.WEBSOCKET_MESSAGE_TYPE]: message.type,
      };
      try {
        clientLogger.info({ ...sendMessageLabels });
        logger('%o', {
          level: 'debug',
          ...sendMessageLabels,
        });
        client.send(JSON.stringify(message));
      } catch (error) {
        clientLogger.error({ ...sendMessageLabels });
        logger('%o', {
          level: 'error',
          ...sendMessageLabels,
        });
        if (isRetry) {
          if (observer !== undefined) {
            this.reportError(observer, error);
          }
        } else {
          this.sendMessage(message, observer, true);
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
      const receivedDataErrLabels = {
        ...this.labels,
        title: 'websocket_client_server_message_parse_error',
        error: error.message,
        [labels.WEBSOCKET_MESSAGEJSON]: messageJSON,
      };
      clientLogger.error({ ...receivedDataErrLabels });
      logger('%o', {
        level: 'error',
        ...receivedDataErrLabels,
      });

      return;
    }

    const receivedDataLabels = {
      ...this.labels,
      title: 'websocket_client_message_received',
      [labels.WEBSOCKET_MESSAGE_TYPE]: message.type,
    };
    clientLogger.info({ ...receivedDataLabels });
    logger('%o', {
      level: 'debug',
      ...receivedDataLabels,
    });

    const handleError = (id: string, msg: string, del?: boolean) => {
      const handleErrorLabels = {
        ...this.labels,
        title: 'websocket_client_message_received',
      };
      clientLogger.error({ ...handleErrorLabels }, msg);
      logger('%o', {
        level: 'error',
        ...handleErrorLabels,
        error: msg,
      });
      const operation = this.mutableOperations[id] as Operation | undefined;
      if (operation !== undefined) {
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
