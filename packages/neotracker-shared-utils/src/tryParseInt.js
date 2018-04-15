/* @flow */
import { SOMETHING_WENT_WRONG, ClientError } from './errors';

const DEFAULT = Object.create(null);

export default ({
  value,
  // $FlowFixMe
  default: defaultValue = DEFAULT,
}: {|
  value: string,
  default?: ?number | typeof DEFAULT,
|}) => {
  const result = Number(value);
  if (Number.isNaN(result) || !Number.isInteger(result)) {
    if (defaultValue === DEFAULT) {
      throw new ClientError(SOMETHING_WENT_WRONG);
    } else {
      return defaultValue;
    }
  }
  return result;
};
