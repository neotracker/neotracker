/* @flow */
export type JSONSerializable =
  | ?{ [key: string]: JSONSerializable }
  | ?Array<JSONSerializable>
  | ?number
  | ?string
  | ?boolean;
