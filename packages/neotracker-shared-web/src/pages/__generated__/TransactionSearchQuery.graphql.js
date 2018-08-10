/**
 * @flow
 * @relayHash e45d916864a4046f54256bf4c0a0a050
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type TransactionPagingView_transactions$ref = any;
export type TransactionSearchQueryVariables = {|
  first: number,
  after?: ?string,
|};
export type TransactionSearchQueryResponse = {|
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
  |}
|};
export type TransactionSearchQuery = {|
  variables: TransactionSearchQueryVariables,
  response: TransactionSearchQueryResponse,
|};
*/


/*
query TransactionSearchQuery(
  $first: Int!
  $after: String
) {
  transactions(orderBy: [{name: "transaction.id", direction: "desc"}], filters: [{name: "transaction.type", operator: "!=", value: "MinerTransaction"}], first: $first, after: $after) {
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
    "name": "after",
    "variableName": "after",
    "type": "String"
  },
  {
    "kind": "Literal",
    "name": "filters",
    "value": [
      {
        "name": "transaction.type",
        "operator": "!=",
        "value": "MinerTransaction"
      }
    ],
    "type": "[FilterInput!]"
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
        "name": "transaction.id"
      }
    ],
    "type": "[OrderByInput!]"
  }
],
v2 = {
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
  "name": "TransactionSearchQuery",
  "id": "2",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "TransactionSearchQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transactions",
        "storageKey": null,
        "args": v1,
        "concreteType": "TransactionsConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "TransactionsEdge",
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
          v2
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "TransactionSearchQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transactions",
        "storageKey": null,
        "args": v1,
        "concreteType": "TransactionsConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "TransactionsEdge",
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
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "id",
                    "args": null,
                    "storageKey": null
                  },
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
          v2
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '4860721ba4e9f38229ff36fc7e9905a5';
module.exports = node;
