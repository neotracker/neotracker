/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: HomeQuery
// ====================================================

export interface HomeQuery_first {
  __typename: "Block";
  id: string;
  hash: string;
}

export interface HomeQuery_second {
  __typename: "Block";
  id: string;
  hash: string;
}

export interface HomeQuery {
  first: HomeQuery_first | null;
  second: HomeQuery_second | null;
}
