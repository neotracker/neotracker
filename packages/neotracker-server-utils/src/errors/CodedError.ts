import { ClientError } from '@neotracker/shared-utils';

export enum ErrorCode {
  GRAPHQL_QUERY_NOT_FOUND_ERROR = 'Something went wrong. Try refreshing the page or going back to where you were.',
  GRAPHQL_ERROR = 'Something went wrong. Try refreshing the page or going back to where you were.',
  INVALID_CSRF_TOKEN = 'Something went wrong. Try refreshing the page or going back to where you were.',
  NOT_FOUND_ERROR = 'Something went wrong. Try refreshing the page or going back to where you were.',
  PROGRAMMING_ERROR = 'Something went wrong. Try refreshing the page or going back to where you were.',
  INVALID_GRAPHQL_METHOD = 'Something went wrong. Try refreshing the page or going back to where you were.',
  INVALID_GRAPHQL_FIELDS_NULL = 'Something went wrong. Try refreshing the page or going back to where you were.',
  INVALID_GRAPHQL_FIELDS_ARRAY = 'Something went wrong. Try refreshing the page or going back to where you were.',
  INVALID_CLIENT_COLLECTOR_FIELDS_NULL = 'Something went wrong. Report received was null or undefined.',
  INVALID_CLIENT_COLLECTOR_FIELDS_OBJECT = 'Something went wrong. Report received was not a JSON object.',
  INVALID_DISCORD_ALERTER_FIELDS_NULL = 'Something went wrong. Alert received was null or undefined.',
  INVALID_DISCORD_ALERTER_FIELDS_OBJECT = 'Something went wrong.  Alert received was not a JSON object.',
  VALIDATION_ERROR = 'Something went wrong. Try refreshing the page or going back to where you were.',
  PERMISSION_DENIED = 'You are not allowed to take that action.',
  BAD_ACME_CHALLENGE_REQUEST = 'Invalid request format.',
  UNKNOWN_ACME_CHALLENGE_TOKEN = 'Unknown token.',
  MISSING_X_HUB_SIGNATURE = 'Missing X-Hub Signature',
  INVALID_X_HUB_SIGNATURE = 'Invalid X-Hub Signature',
  INVALID_GITHUB_FIELDS_NULL = 'Invalid Payload',
  INVALID_GITHUB_FIELDS_OBJECT = 'Invalid Payload',
  INVALID_GITHUB_EVENT = 'Invalid Event',
}

export class CodedError extends ClientError {
  public static readonly GRAPHQL_QUERY_NOT_FOUND_ERROR = 'GRAPHQL_QUERY_NOT_FOUND_ERROR';
  public static readonly GRAPHQL_ERROR = 'GRAPHQL_ERROR';
  public static readonly INVALID_CSRF_TOKEN = 'INVALID_CSRF_TOKEN';
  public static readonly NOT_FOUND_ERROR = 'NOT_FOUND_ERROR';
  public static readonly PROGRAMMING_ERROR = 'PROGRAMMING_ERROR';
  public static readonly INVALID_GRAPHQL_METHOD = 'INVALID_GRAPHQL_METHOD';
  public static readonly INVALID_GRAPHQL_FIELDS_NULL = 'INVALID_GRAPHQL_FIELDS_NULL';
  public static readonly INVALID_GRAPHQL_FIELDS_ARRAY = 'INVALID_GRAPHQL_FIELDS_ARRAY';
  public static readonly INVALID_CLIENT_COLLECTOR_FIELDS_NULL = 'INVALID_CLIENT_COLLECTOR_FIELDS_NULL';
  public static readonly INVALID_CLIENT_COLLECTOR_FIELDS_OBJECT = 'INVALID_CLIENT_COLLECTOR_FIELDS_OBJECT';
  public static readonly INVALID_DISCORD_ALERTER_FIELDS_NULL = 'INVALID_DISCORD_ALERTER_FIELDS_NULL';
  public static readonly INVALID_DISCORD_ALERTER_FIELDS_OBJECT = 'INVALID_DISCORD_ALERTER_FIELDS_OBJECT';
  public static readonly VALIDATION_ERROR = 'VALIDATION_ERROR';
  public static readonly PERMISSION_DENIED = 'PERMISSION_DENIED';
  public static readonly BAD_ACME_CHALLENGE_REQUEST = 'BAD_ACME_CHALLENGE_REQUEST';
  public static readonly UNKNOWN_ACME_CHALLENGE_TOKEN = 'UNKNOWN_ACME_CHALLENGE_TOKEN';
  public static readonly MISSING_X_HUB_SIGNATURE = 'MISSING_X_HUB_SIGNATURE';
  public static readonly INVALID_X_HUB_SIGNATURE = 'INVALID_X_HUB_SIGNATURE';
  public static readonly INVALID_GITHUB_FIELDS_NULL = 'INVALID_GITHUB_FIELDS_NULL';
  public static readonly INVALID_GITHUB_FIELDS_OBJECT = 'INVALID_GITHUB_FIELDS_OBJECT';
  public static readonly INVALID_GITHUB_EVENT = 'INVALID_GITHUB_EVENT';
  public readonly code: string;

  public constructor(
    errorCode: keyof typeof ErrorCode,
    options: {
      readonly message?: string;
      readonly originalError?: Error;
    } = {},
  ) {
    super(options.message === undefined ? ErrorCode[errorCode] : options.message, options.originalError);

    this.code = errorCode;
  }
}
