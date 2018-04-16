/* @flow */

export default function values<TValue>(obj: {
  [key: string]: TValue,
}): Array<TValue> {
  return (Object.values(obj): $FlowFixMe);
}
