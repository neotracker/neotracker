/**
 * @flow
 * @relayHash e972d1a6ba25216577b24c2ab3cd4032
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type TransactionPagingView_transactions$ref = any;
export type AssetTransactionPagingViewQueryVariables = {|
  hash: string,
  first: number,
  after?: ?string,
|};
export type AssetTransactionPagingViewQueryResponse = {|
  +asset: ?{|
    +id: string,
    +transactions: {|
      +edges: $ReadOnlyArray<{|
        +node: {|
          +$fragmentRefs: TransactionPagingView_transactions$ref
        |}
      |}>,
      +pageInfo: {|
        +hasPreviousPage: boolean,
        +hasNextPage: boolean,
      |},
    |},
  |}
|};
export type AssetTransactionPagingViewQuery = {|
  variables: AssetTransactionPagingViewQueryVariables,
  response: AssetTransactionPagingViewQueryResponse,
|};
*/


/*
query AssetTransactionPagingViewQuery(
  $hash: String!
  $first: Int!
  $after: String
) {
  asset(hash: $hash) {
    id
    transactions(first: $first, after: $after, orderBy: [{name: "asset_to_transaction.id2", direction: "desc", type: "literal"}]) {
      edges {
        node {
          ...TransactionPagingView_transactions
          id
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
      }
    }
  }
}

fragment TransactionPagingView_transactions on Transaction {
  ...TransactionTable_transactions
}

fragment TransactionTable_transactions on Transaction {
  id
  ...TransactionSummary_transaction
}

fragment TransactionSummary_transaction on Transaction {
  hash
  ...TransactionSummaryHeader_transaction
}

fragment TransactionSummaryHeader_transaction on Transaction {
  ...TransactionHeaderBackground_transaction
  ...TransactionTypeAndLink_transaction
  type
  block_time
}

fragment TransactionHeaderBackground_transaction on Transaction {
  type
}

fragment TransactionTypeAndLink_transaction on Transaction {
  type
  hash
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "hash",
    "type": "String!",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "first",
    "type": "Int!",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "after",
    "type": "String",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "hash",
    "variableName": "hash",
    "type": "String!"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v3 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after",
    "type": "String"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first",
    "type": "Int"
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "desc",
        "name": "asset_to_transaction.id2",
        "type": "literal"
      }
    ],
    "type": "[OrderByInput!]"
  }
],
v4 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "pageInfo",
  "storageKey": null,
  "args": null,
  "concreteType": "PageInfo",
  "plural": false,
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "hasPreviousPage",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "hasNextPage",
      "args": null,
      "storageKey": null
    }
  ]
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "AssetTransactionPagingViewQuery",
  "id": "24",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "AssetTransactionPagingViewQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "asset",
        "storageKey": null,
        "args": v1,
        "concreteType": "Asset",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "transactions",
            "storageKey": null,
            "args": v3,
            "concreteType": "AssetToTransactionsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "AssetToTransactionsEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "Transaction",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "FragmentSpread",
                        "name": "TransactionPagingView_transactions",
                        "args": null
                      }
                    ]
                  }
                ]
              },
              v4
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "AssetTransactionPagingViewQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "asset",
        "storageKey": null,
        "args": v1,
        "concreteType": "Asset",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "transactions",
            "storageKey": null,
            "args": v3,
            "concreteType": "AssetToTransactionsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "AssetToTransactionsEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "Transaction",
                    "plural": false,
                    "selections": [
                      v2,
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "hash",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "type",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "block_time",
                        "args": null,
                        "storageKey": null
                      }
                    ]
                  }
                ]
              },
              v4
            ]
          }
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'bd69ebc207cd3673b421e0c694e60d9f';
module.exports = node;
