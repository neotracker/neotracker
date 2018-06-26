import { ClientError, SOMETHING_WENT_WRONG } from './ClientError';

export const sanitizeErrorNullable = (error: Error): ClientError | undefined => {
  if (error instanceof ClientError) {
    return error;
  }

  const clientError = ClientError.getClientError(error);
  if (clientError !== undefined) {
    return clientError;
  }

  return undefined;
};

export const sanitizeError = (error: Error): ClientError => {
  const sanitizedError = sanitizeErrorNullable(error);

  return sanitizedError === undefined ? new ClientError(SOMETHING_WENT_WRONG) : sanitizedError;
};
