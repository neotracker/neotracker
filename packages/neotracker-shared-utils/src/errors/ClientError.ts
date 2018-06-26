import { BaseError } from './BaseError';

const CLIENT_ERROR_PREFIX = 'CLIENT:';

export const SOMETHING_WENT_WRONG = 'Something went wrong. Try refreshing the page or going back to where you were.';
export const NETWORK_ERROR = 'Network failure. Try refreshing the page.';
export const COPY_UNSUPPORTED_BROWSER = 'Copying to clipboard is not supported in your browser.';

const STATUS_CODE_TO_MESSAGE: { [K in string]?: string } = {
  '503': 'Server is under heavy load. Please try again later.',
};

export class ClientError extends BaseError {
  public static extractClientErrorMessage(message: string): string | undefined {
    if (message.startsWith(CLIENT_ERROR_PREFIX)) {
      return message.substr(CLIENT_ERROR_PREFIX.length);
    }

    return undefined;
  }

  public static getClientError(error: Error): ClientError | undefined {
    const message = this.extractClientErrorMessage(error.message);
    if (message !== undefined) {
      return new ClientError(message, error);
    }

    return undefined;
  }

  public static getMessageForStatusCode(statusCode: number): string {
    const message = STATUS_CODE_TO_MESSAGE[`${statusCode}`];

    return message === undefined ? SOMETHING_WENT_WRONG : message;
  }

  public static async getFromResponse(response: Response): Promise<ClientError> {
    let originalMessage;
    let message;
    let error = new Error(`HTTP Error ${response.status}`);
    try {
      originalMessage = await response.text();
      message = this.extractClientErrorMessage(originalMessage);
      error = new Error(`HTTP Error ${response.status}: ${originalMessage}`);
    } catch {
      // Do nothing
    }

    return new ClientError(message === undefined ? this.getMessageForStatusCode(response.status) : message, error);
  }

  public static getFromNetworkError(error: Error): ClientError {
    return new ClientError(NETWORK_ERROR, error);
  }

  public readonly clientMessage: string;

  public constructor(message: string, originalError?: Error | undefined) {
    super(`${CLIENT_ERROR_PREFIX}${message}`, originalError);
    this.clientMessage = message;
  }
}
