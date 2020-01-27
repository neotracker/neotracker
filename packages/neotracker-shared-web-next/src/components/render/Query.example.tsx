/* tslint:disable: no-any */
import { PExample } from '@neotracker/component-explorer';
import gql from 'graphql-tag';
import * as React from 'react';
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
export const examples: readonly[PExample<QueryProps<ExampleBlockQuery, ExampleBlockQueryVariables>>] = [
  {
    // Not really a component, but it's a hacky way to get it into the documentation
    // tslint:disable-next-line no-any
    component: makeQuery as any,
    element: (
      ref:
        | string
        | ((instance: React.Component<QueryProps<ExampleBlockQuery, ExampleBlockQueryVariables>, any> | null) => any)
        | React.RefObject<React.Component<QueryProps<ExampleBlockQuery, ExampleBlockQueryVariables>, any>>
        | undefined,
    ) => (
      <BlockQuery ref={ref} variables={{ index: 0 }}>
        {({ data, error }) => {
          if (data.block != undefined) {
            return (
              <div>
                {data.block.hash}
                <TransactionQuery variables={{ hash: data.block.transactions.edges[0].node.hash }}>
                  {({ data: transactionData, error: transactionError }) => {
                    if (transactionData.transaction != undefined) {
                      return <div>{transactionData.transaction.type}</div>;
                    }

                    if (transactionError) {
                      return <div>Error: {transactionError.message}</div>;
                    }

                    return <div>Loading...</div>;
                  }}
                </TransactionQuery>
              </div>
            );
          }

          if (error) {
            return <div>Error: {error.message}</div>;
          }

          return <div>Loading...</div>;
        }}
      </BlockQuery>
    ),
  },
] as any;
