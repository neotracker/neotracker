export interface ObjectJSONSerializable {
  // tslint:disable-next-line readonly-keyword
  [key: string]: JSONSerializable;
}
export interface ArrayJSONSerializable extends Array<JSONSerializable> {}
export type JSONSerializable =
  | ObjectJSONSerializable
  | ArrayJSONSerializable
  | number
  | string
  | boolean
  | undefined
  | null;
