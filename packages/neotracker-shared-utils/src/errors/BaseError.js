/* @flow */
import CustomError from './CustomError';

export default class BaseError extends CustomError {
  originalError: ?Error | void;
  constructor(message: string, originalError?: ?Error) {
    super(message);
    this.originalError = originalError;
  }
}
