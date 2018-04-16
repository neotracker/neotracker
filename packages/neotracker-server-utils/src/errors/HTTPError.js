/* @flow */
import CodedError, { type ErrorCode } from './CodedError';

type StatusCode = 400 | 403 | 404 | 500 | 503;
export default class HTTPError extends CodedError {
  expose: boolean;
  status: number;
  statusCode: number;

  constructor(statusCode: StatusCode, errorCode: ErrorCode) {
    super(errorCode);
    this.expose = true;
    this.status = statusCode;
    this.statusCode = statusCode;
  }
}
