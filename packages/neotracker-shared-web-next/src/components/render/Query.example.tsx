import gql from 'graphql-tag';
import { PExample } from 'neotracker-component-explorer';
import * as React from 'react';
import { Base } from 'reakit';
import { ExampleBlockQuery } from './__generated__/ExampleBlockQuery';
import { ExampleTransactionQuery } from './__generated__/ExampleTransactionQuery';
import { makeQuery, QueryProps } from './Query';

const TransactionQuery = makeQuery<ExampleTransactionQuery>({
  query: gql`
    query ExampleTransactionQuery($hash: String!) {
      transaction(hash: $hash) {
        id
        type
      }
    }
  `,
});

interface ExampleBlockQueryVariables {
  readonly index: number;
}
const BlockQuery = makeQuery<ExampleBlockQuery, ExampleBlockQueryVariables>({
  query: gql`
    query ExampleBlockQuery($index: Int!) {
      block(index: $index) {
        id
        hash
        transactions(first: 1, orderBy: [{ name: "transaction.index", direction: "asc" }]) {
          edges {
            node {
              hash
            }
          }
        }
      }
    }
  `,
  fetchNextData: async (appContext, { data }) => {
    if (data.block !== null && data.block.transactions.edges.length > 0) {
      await TransactionQuery.fetchData(appContext, { hash: data.block.transactions.edges[0].node.hash });
    }
  },
});

// tslint:disable-next-line export-name
export const examples: [PExample<QueryProps<ExampleBlockQuery, ExampleBlockQueryVariables>>] = [
  {
    element: () => (
      <BlockQuery variables={{ index: 0 }}>
        {({ data, error }) => {
          if (data.block != undefined) {
            return (
              <Base>
                {data.block.hash}
                <TransactionQuery variables={{ hash: data.block.transactions.edges[0].node.hash }}>
                  {({ data: transactionData, error: transactionError }) => {
                    if (transactionData.transaction != undefined) {
                      return <Base>{transactionData.transaction.type}</Base>;
                    }

                    if (transactionError) {
                      return <Base>Error: {transactionError.message}</Base>;
                    }

                    return <Base>Loading...</Base>;
                  }}
                </TransactionQuery>
              </Base>
            );
          }

          if (error) {
            return <Base>Error: {error.message}</Base>;
          }

          return <Base>Loading...</Base>;
        }}
      </BlockQuery>
    ),
  },
];
