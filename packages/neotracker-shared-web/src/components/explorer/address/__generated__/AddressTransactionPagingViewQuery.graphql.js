/**
 * @flow
 * @relayHash 898c4b6f167ccae536fed811ca390f81
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type TransactionPagingView_transactions$ref = any;
export type AddressTransactionPagingViewQueryVariables = {|
  hash: string,
  first: number,
  after?: ?string,
|};
export type AddressTransactionPagingViewQueryResponse = {|
  +address: ?{|
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
export type AddressTransactionPagingViewQuery = {|
  variables: AddressTransactionPagingViewQueryVariables,
  response: AddressTransactionPagingViewQueryResponse,
|};
*/


/*
query AddressTransactionPagingViewQuery(
  $hash: String!
  $first: Int!
  $after: String
) {
  address(hash: $hash) {
    id
    transactions(first: $first, after: $after, orderBy: [{name: "address_to_transaction.id2", direction: "desc", type: "literal"}]) {
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
        "name": "address_to_transaction.id2",
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
  "name": "AddressTransactionPagingViewQuery",
  "id": "16",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "AddressTransactionPagingViewQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "address",
        "storageKey": null,
        "args": v1,
        "concreteType": "Address",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "transactions",
            "storageKey": null,
            "args": v3,
            "concreteType": "AddressToTransactionsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "AddressToTransactionsEdge",
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
    "name": "AddressTransactionPagingViewQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "address",
        "storageKey": null,
        "args": v1,
        "concreteType": "Address",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "transactions",
            "storageKey": null,
            "args": v3,
            "concreteType": "AddressToTransactionsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "AddressToTransactionsEdge",
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
(node/*: any*/).hash = '4a91dd5c45d7bd840e46b623076a7b27';
module.exports = node;
