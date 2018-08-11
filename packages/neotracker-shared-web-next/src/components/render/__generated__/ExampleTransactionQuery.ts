/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ExampleTransactionQuery
// ====================================================

export interface ExampleTransactionQuery_transaction {
  __typename: "Transaction";
  id: string;
  type: string;
}

export interface ExampleTransactionQuery {
  transaction: ExampleTransactionQuery_transaction | null;
}

export interface ExampleTransactionQueryVariables {
  hash: string;
}
