export class BaseError extends Error {
  public readonly originalError: Error | undefined | void;

  public constructor(message: string, originalError?: Error | undefined) {
    super(message);
    this.message = message;
    this.originalError = originalError;

    // tslint:disable-next-line no-any
    (this as any).__proto__ = BaseError.prototype;
  }
}
