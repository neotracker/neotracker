import { ClientError, SOMETHING_WENT_WRONG } from './errors';

// tslint:disable-next-line no-null-keyword
const DEFAULT = Object.create(null);

export const tryParseDateStringToSeconds = ({
  value,
  // $FlowFixMe
  default: defaultValue = DEFAULT,
}: {
  readonly value: string;
  readonly default?: string | undefined | typeof DEFAULT;
}) => {
  const result = new Date(value).getTime() / 1000;
  if (Number.isNaN(result)) {
    if (defaultValue === DEFAULT) {
      throw new ClientError(SOMETHING_WENT_WRONG);
    }

    return defaultValue;
  }

  return result;
};
