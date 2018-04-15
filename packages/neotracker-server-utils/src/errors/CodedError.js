/* @flow */
import { SOMETHING_WENT_WRONG, ClientError } from 'neotracker-shared-utils';

const ERROR_CODES = {
  GRAPHQL_QUERY_NOT_FOUND_ERROR: SOMETHING_WENT_WRONG,
  GRAPHQL_ERROR: SOMETHING_WENT_WRONG,
  INVALID_CSRF_TOKEN: SOMETHING_WENT_WRONG,
  NOT_FOUND_ERROR: SOMETHING_WENT_WRONG,
  PROGRAMMING_ERROR: SOMETHING_WENT_WRONG,
  INVALID_GRAPHQL_METHOD: SOMETHING_WENT_WRONG,
  INVALID_GRAPHQL_FIELDS_NULL: SOMETHING_WENT_WRONG,
  INVALID_GRAPHQL_FIELDS_ARRAY: SOMETHING_WENT_WRONG,
  VALIDATION_ERROR: SOMETHING_WENT_WRONG,
  PERMISSION_DENIED: 'You are not allowed to take that action.',
  BAD_ACME_CHALLENGE_REQUEST: 'Invalid request format.',
  UNKNOWN_ACME_CHALLENGE_TOKEN: 'Unknown token.',
};

export type ErrorCode = $Keys<typeof ERROR_CODES>;

export default class CodedError extends ClientError {
  static GRAPHQL_QUERY_NOT_FOUND_ERROR = 'GRAPHQL_QUERY_NOT_FOUND_ERROR';
  static GRAPHQL_ERROR = 'GRAPHQL_ERROR';
  static INVALID_CSRF_TOKEN = 'INVALID_CSRF_TOKEN';
  static NOT_FOUND_ERROR = 'NOT_FOUND_ERROR';
  static PROGRAMMING_ERROR = 'PROGRAMMING_ERROR';
  static INVALID_GRAPHQL_METHOD = 'INVALID_GRAPHQL_METHOD';
  static INVALID_GRAPHQL_FIELDS_NULL = 'INVALID_GRAPHQL_FIELDS_NULL';
  static INVALID_GRAPHQL_FIELDS_ARRAY = 'INVALID_GRAPHQL_FIELDS_ARRAY';
  static VALIDATION_ERROR = 'VALIDATION_ERROR';
  static PERMISSION_DENIED = 'PERMISSION_DENIED';
  static BAD_ACME_CHALLENGE_REQUEST = 'BAD_ACME_CHALLENGE_REQUEST';
  static UNKNOWN_ACME_CHALLENGE_TOKEN = 'UNKNOWN_ACME_CHALLENGE_TOKEN';
  code: string;

  constructor(
    errorCode: ErrorCode,
    optionsIn?: {|
      message?: string,
      originalError?: Error,
    |},
  ) {
    const options = optionsIn || {};
    super(
      options.message == null ? ERROR_CODES[errorCode] : options.message,
      options.originalError,
    );
    this.code = errorCode;
  }
}
