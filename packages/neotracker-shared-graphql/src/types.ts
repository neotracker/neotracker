export interface CacheConfig {
  readonly force?: boolean | undefined;
  readonly poll?: number | undefined;
}
export interface PageInfo {
  readonly hasNextPage?: boolean;
  readonly hasPreviousPage?: boolean;
  readonly startCursor?: string;
  readonly endCursor?: string;
}

export interface PagingFirst {
  readonly first: number;
  readonly after?: string;
}

// tslint:disable
export const isPagingFirst = (paging: Paging): paging is PagingFirst => (paging as any).first !== undefined;

export interface PagingLast {
  readonly last: number;
  readonly before?: string;
}

export const isPagingLast = (paging: Paging): paging is PagingLast => (paging as any).last !== undefined;

export type Paging = PagingFirst | PagingLast | {};
export interface Edge<Node> {
  readonly cursor: string;
  readonly node: Node;
}
export interface Connection<Node> {
  readonly edges?: ReadonlyArray<Edge<Node>>;
  readonly pageInfo?: PageInfo;
}
export type Operator = '=' | '!=' | 'in' | 'is_null' | 'is_not_null';

// eslint-disable-next-line
export const OPERATORS: ReadonlyArray<string> = ['=', '!=', 'in', 'is_null', 'is_not_null'];
export interface FilterInput {
  readonly name: string;
  readonly operator: Operator;
  readonly value: string;
}
export interface OrderByInput {
  readonly name: string;
  readonly direction: 'asc' | 'desc' | 'asc nulls last' | 'desc nulls last' | 'asc nulls first' | 'desc nulls first';

  readonly type?: 'literal';
}
