/* @flow */
export type ExecutionResult = {|
  data?: ?mixed,
  errors?: Array<{| message: string |}>,
|};

export const GRAPHQL_WS = 'graphql-ws';

export type ServerMessage =
  | {|
      type: 'GQL_INVALID_MESSAGE_ERROR',
      message: string,
    |}
  | {|
      type: 'GQL_SEND_ERROR',
      message: string,
    |}
  | {|
      type: 'GQL_SOCKET_ERROR',
      message: string,
    |}
  | {|
      type: 'GQL_CONNECTION_ACK',
    |}
  | {|
      type: 'GQL_QUERY_MAP_ERROR',
      message: string,
      id: string,
    |}
  | {|
      type: 'GQL_SUBSCRIBE_ERROR',
      message: string,
      id: string,
    |}
  | {|
      type: 'GQL_DATA',
      id: string,
      value: ExecutionResult,
    |}
  | {|
      type: 'GQL_DATA_ERROR',
      id: string,
      message: string,
    |};

const SERVER_MESSAGE_TYPES = [
  'GQL_INVALID_MESSAGE_ERROR',
  'GQL_SEND_ERROR',
  'GQL_SOCKET_ERROR',
  'GQL_CONNECTION_ACK',
  'GQL_QUERY_MAP_ERROR',
  'GQL_SUBSCRIBE_ERROR',
  'GQL_DATA',
  'GQL_DATA_ERROR',
];

export const parseAndValidateServerMessage = (
  messageJSON: string,
): ServerMessage => {
  const message = JSON.parse(messageJSON);
  if (typeof message !== 'object' || typeof message.type !== 'string') {
    throw new Error('Invalid message format.');
  }

  if (!SERVER_MESSAGE_TYPES.includes(message.type)) {
    throw new Error(`Unknown message type: ${message.type}`);
  }

  let valid;
  const type = (message.type: $PropertyType<ServerMessage, 'type'>);
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
      valid =
        typeof message.message === 'string' && typeof message.id === 'string';
      break;
    case 'GQL_SUBSCRIBE_ERROR':
      valid =
        typeof message.id === 'string' && typeof message.message === 'string';
      break;
    case 'GQL_DATA':
      valid =
        typeof message.id === 'string' &&
        typeof message.value === 'object' &&
        (message.value.data == null ||
          typeof message.value.data === 'object') &&
        (message.value.errors == null ||
          (Array.isArray(message.value.errors) &&
            message.value.errors.every(
              error =>
                typeof error === 'object' && typeof error.message === 'string',
            )));
      break;
    case 'GQL_DATA_ERROR':
      valid =
        typeof message.id === 'string' && typeof message.message === 'string';
      break;
    default:
      // eslint-disable-next-line
      (type: empty);
      valid = false;
      break;
  }

  if (!valid) {
    throw new Error('Invalid message format.');
  }

  return message;
};

export type ClientStartMessage = {|
  type: 'GQL_START',
  id: string,
  query: {|
    id: string,
    variables: Object,
  |},
  span: any,
|};
export type ClientMessage =
  | {|
      type: 'GQL_CONNECTION_INIT',
    |}
  | {|
      type: 'GQL_CONNECTION_TERMINATE',
    |}
  | ClientStartMessage
  | {|
      type: 'GQL_STOP',
      id: string,
    |};

const CLIENT_MESSAGE_TYPES = [
  'GQL_CONNECTION_INIT',
  'GQL_CONNECTION_TERMINATE',
  'GQL_START',
  'GQL_STOP',
];

export const parseAndValidateClientMessage = (
  messageJSON: string,
): ClientMessage => {
  const message = JSON.parse(messageJSON);
  if (typeof message !== 'object' || typeof message.type !== 'string') {
    throw new Error('Invalid message format.');
  }

  if (!CLIENT_MESSAGE_TYPES.includes(message.type)) {
    throw new Error(`Unknown message type: ${message.type}`);
  }

  let valid;
  const type = (message.type: $PropertyType<ClientMessage, 'type'>);
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
      // eslint-disable-next-line
      (type: empty);
      valid = false;
      break;
  }

  if (!valid) {
    throw new Error(`Invalid message format for type ${type}.`);
  }

  return message;
};
