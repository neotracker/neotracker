/* @flow */
export type CacheConfig = {
  force?: ?boolean,
  poll?: ?number,
};

export type PageInfo = {|
  hasNextPage?: boolean,
  hasPreviousPage?: boolean,
  startCursor?: string,
  endCursor?: string,
|};

export type Paging =
  | {| first: number, after?: string |}
  | {| last: number, before: string |}
  | {||};

export type Edge<Node> = {|
  cursor: string,
  node: Node,
|};

export type Connection<Node> = {
  edges?: Array<Edge<Node>>,
  pageInfo?: PageInfo,
};

export type Operator = '=' | '!=' | 'in' | 'is_null' | 'is_not_null';

// eslint-disable-next-line
export const OPERATORS = ['=', '!=', 'in', 'is_null', 'is_not_null'];

export type FilterInput = {|
  name: string,
  operator: Operator,
  value: string,
|};

export type OrderByInput = {|
  name: string,
  direction:
    | 'asc'
    | 'desc'
    | 'asc nulls last'
    | 'desc nulls last'
    | 'asc nulls first'
    | 'desc nulls first',
|};
