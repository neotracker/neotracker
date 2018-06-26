import { ClientError, SOMETHING_WENT_WRONG } from './errors';

// tslint:disable-next-line no-null-keyword
const DEFAULT = Object.create(null);

export const tryParseInt = ({
  value,
  // $FlowFixMe
  default: defaultValue = DEFAULT,
}: {
  readonly value: string;
  readonly default?: number | undefined | typeof DEFAULT;
}) => {
  const result = Number(value);
  if (Number.isNaN(result) || !Number.isInteger(result)) {
    if (defaultValue === DEFAULT) {
      throw new ClientError(SOMETHING_WENT_WRONG);
    }

    return defaultValue;
  }

  return result;
};
