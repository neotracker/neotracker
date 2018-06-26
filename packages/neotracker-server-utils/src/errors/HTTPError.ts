import { CodedError, ErrorCode } from './CodedError';
type StatusCode = 400 | 403 | 404 | 500 | 503;

export class HTTPError extends CodedError {
  public readonly expose: boolean;
  public readonly status: number;
  public readonly statusCode: number;

  public constructor(statusCode: StatusCode, errorCode: keyof typeof ErrorCode) {
    super(errorCode);
    this.expose = true;
    this.status = statusCode;
    this.statusCode = statusCode;
  }
}
