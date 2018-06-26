import { CodedError } from './CodedError';

export class ValidationError extends CodedError {
  public constructor(message: string) {
    super(CodedError.VALIDATION_ERROR, { message });
  }
}
