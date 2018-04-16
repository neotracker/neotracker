/* @flow */

export default function entries<TKey: string, TValue>(obj: {
  [key: TKey]: TValue,
}): Array<[string, TValue]> {
  return (Object.entries(obj): $FlowFixMe);
}
