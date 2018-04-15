/* @flow */
import CodedError from './CodedError';

export default class ValidationError extends CodedError {
  constructor(message: string) {
    super(CodedError.VALIDATION_ERROR, { message });
  }
}
