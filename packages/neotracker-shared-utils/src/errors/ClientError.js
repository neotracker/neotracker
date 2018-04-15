/* @flow */
import BaseError from './BaseError';

const CLIENT_ERROR_PREFIX = 'CLIENT:';

export const SOMETHING_WENT_WRONG =
  'Something went wrong. Try refreshing the page or going back to where you ' +
  'were.';
export const NETWORK_ERROR = 'Network failure. Try refreshing the page.';
export const COPY_UNSUPPORTED_BROWSER =
  'Copying to clipboard is not supported in your browser.';

const STATUS_CODE_TO_MESSAGE = {
  '503': 'Server is under heavy load. Please try again later.',
};

export default class ClientError extends BaseError {
  clientMessage: string;

  constructor(message: string, originalError?: ?Error) {
    super(`${CLIENT_ERROR_PREFIX}${message}`, originalError);
    this.clientMessage = message;
  }

  static extractClientErrorMessage(message: string): ?string {
    if (message.startsWith(CLIENT_ERROR_PREFIX)) {
      return message.substr(CLIENT_ERROR_PREFIX.length);
    }

    return null;
  }

  static getClientError(error: Error): ?ClientError {
    const message = this.extractClientErrorMessage(error.message);
    if (message != null) {
      return new ClientError(message, error);
    }

    return null;
  }

  static getMessageForStatusCode(statusCode: number): string {
    return STATUS_CODE_TO_MESSAGE[`${statusCode}`] || SOMETHING_WENT_WRONG;
  }

  static async getFromResponse(response: Response): Promise<ClientError> {
    let originalMessage;
    let message;
    let error = new Error(`HTTP Error ${response.status}`);
    try {
      originalMessage = await response.text();
      message = this.extractClientErrorMessage(originalMessage);
      error = new Error(`HTTP Error ${response.status}: ${originalMessage}`);
    } catch (err) {
      // Do nothing
    }
    return new ClientError(
      message == null ? this.getMessageForStatusCode(response.status) : message,
      error,
    );
  }

  static getFromNetworkError(error: Error): ClientError {
    return new ClientError(NETWORK_ERROR, error);
  }
}
