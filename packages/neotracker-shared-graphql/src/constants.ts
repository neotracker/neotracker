import { utils } from '@neotracker/shared-utils';

export interface ExecutionResult {
  readonly data?: {} | undefined;
  readonly errors?: ReadonlyArray<{ readonly message: string }>;
}

export const GRAPHQL_WS = 'graphql-ws';
export type ServerMessage =
  | {
      readonly type: 'GQL_INVALID_MESSAGE_ERROR';
      readonly message: string;
    }
  | {
      readonly type: 'GQL_SEND_ERROR';
      readonly message: string;
    }
  | {
      readonly type: 'GQL_SOCKET_ERROR';
      readonly message: string;
    }
  | {
      readonly type: 'GQL_CONNECTION_ACK';
    }
  | {
      readonly type: 'GQL_QUERY_MAP_ERROR';
      readonly message: string;
      readonly id: string;
    }
  | {
      readonly type: 'GQL_SUBSCRIBE_ERROR';
      readonly message: string;
      readonly id: string;
    }
  | {
      readonly type: 'GQL_DATA';
      readonly id: string;
      readonly value: ExecutionResult;
    }
  | {
      readonly type: 'GQL_DATA_ERROR';
      readonly id: string;
      readonly message: string;
    };

const SERVER_MESSAGE_TYPES: ReadonlyArray<string> = [
  'GQL_INVALID_MESSAGE_ERROR',
  'GQL_SEND_ERROR',
  'GQL_SOCKET_ERROR',
  'GQL_CONNECTION_ACK',
  'GQL_QUERY_MAP_ERROR',
  'GQL_SUBSCRIBE_ERROR',
  'GQL_DATA',
  'GQL_DATA_ERROR',
];

export const parseAndValidateServerMessage = (messageJSON: string): ServerMessage => {
  const message = JSON.parse(messageJSON);
  if (typeof message !== 'object' || typeof message.type !== 'string') {
    throw new Error('Invalid message format.');
  }

  if (!SERVER_MESSAGE_TYPES.includes(message.type)) {
    throw new Error(`Unknown message type: ${message.type}`);
  }

  let valid;
  const type = message.type as ServerMessage['type'];
  switch (type) {
    case 'GQL_INVALID_MESSAGE_ERROR':
      valid = typeof message.message === 'string';
      break;
    case 'GQL_SEND_ERROR':
      valid = typeof message.message === 'string';
      break;
    case 'GQL_SOCKET_ERROR':
      valid = typeof message.message === 'string';
      break;
    case 'GQL_CONNECTION_ACK':
      valid = true;
      break;
    case 'GQL_QUERY_MAP_ERROR':
      valid = typeof message.message === 'string' && typeof message.id === 'string';
      break;
    case 'GQL_SUBSCRIBE_ERROR':
      valid = typeof message.id === 'string' && typeof message.message === 'string';
      break;
    case 'GQL_DATA':
      valid =
        typeof message.id === 'string' &&
        typeof message.value === 'object' &&
        (message.value.data == undefined || typeof message.value.data === 'object') &&
        (message.value.errors == undefined ||
          (Array.isArray(message.value.errors) &&
            message.value.errors.every(
              // tslint:disable-next-line no-any
              (error: any) => typeof error === 'object' && typeof error.message === 'string',
            )));

      break;
    case 'GQL_DATA_ERROR':
      valid = typeof message.id === 'string' && typeof message.message === 'string';
      break;
    default:
      utils.assertNever(type);
      valid = false;
  }

  if (!valid) {
    throw new Error('Invalid message format.');
  }

  return message;
};
export interface ClientStartMessage {
  readonly type: 'GQL_START';
  readonly id: string;
  readonly query: {
    readonly id: string;
    readonly variables: object;
  };
}
export type ClientMessage =
  | {
      readonly type: 'GQL_CONNECTION_INIT';
    }
  | {
      readonly type: 'GQL_CONNECTION_TERMINATE';
    }
  | ClientStartMessage
  | {
      readonly type: 'GQL_STOP';
      readonly id: string;
    };

const CLIENT_MESSAGE_TYPES: ReadonlyArray<string> = [
  'GQL_CONNECTION_INIT',
  'GQL_CONNECTION_TERMINATE',
  'GQL_START',
  'GQL_STOP',
];

export const parseAndValidateClientMessage = (messageJSON: string): ClientMessage => {
  const message = JSON.parse(messageJSON);
  if (typeof message !== 'object' || typeof message.type !== 'string') {
    throw new Error('Invalid message format.');
  }

  if (!CLIENT_MESSAGE_TYPES.includes(message.type)) {
    throw new Error(`Unknown message type: ${message.type}`);
  }

  let valid;
  const type = message.type as ClientMessage['type'];
  switch (type) {
    case 'GQL_CONNECTION_INIT':
      valid = true;
      break;
    case 'GQL_CONNECTION_TERMINATE':
      valid = true;
      break;
    case 'GQL_START':
      valid =
        typeof message.id === 'string' &&
        typeof message.query === 'object' &&
        typeof message.query.id === 'string' &&
        typeof message.query.variables === 'object';
      break;
    case 'GQL_STOP':
      valid = typeof message.id === 'string';
      break;
    default:
      utils.assertNever(type);
      valid = false;
  }

  if (!valid) {
    throw new Error(`Invalid message format for type ${type}.`);
  }

  return message;
};
