import { CustomError } from './CustomError';

export class BaseError extends CustomError {
  public readonly originalError: Error | undefined | void;

  public constructor(message: string, originalError?: Error | undefined) {
    super(message);
    this.originalError = originalError;
  }
}
