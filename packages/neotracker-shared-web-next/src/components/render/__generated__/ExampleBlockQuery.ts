/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: ExampleBlockQuery
// ====================================================

export interface ExampleBlockQuery_block_transactions_edges_node {
  __typename: "Transaction";
  hash: string;
}

export interface ExampleBlockQuery_block_transactions_edges {
  __typename: "BlockToTransactionsEdge";
  node: ExampleBlockQuery_block_transactions_edges_node;
}

export interface ExampleBlockQuery_block_transactions {
  __typename: "BlockToTransactionsConnection";
  edges: ExampleBlockQuery_block_transactions_edges[];
}

export interface ExampleBlockQuery_block {
  __typename: "Block";
  id: string;
  hash: string;
  transactions: ExampleBlockQuery_block_transactions;
}

export interface ExampleBlockQuery {
  block: ExampleBlockQuery_block | null;
}

export interface ExampleBlockQueryVariables {
  index: number;
}
