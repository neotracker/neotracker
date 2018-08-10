/**
 * @flow
 * @relayHash 9528584648a4cbb92efe891f63db1a94
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type TransactionOutputTable_outputs$ref = any;
export type TransactionOutputPagingTableQueryVariables = {|
  hash: string,
  first: number,
  after?: ?string,
|};
export type TransactionOutputPagingTableQueryResponse = {|
  +transaction: ?{|
    +outputs: {|
      +edges: $ReadOnlyArray<{|
        +node: {|
          +$fragmentRefs: TransactionOutputTable_outputs$ref
        |}
      |}>,
      +pageInfo: {|
        +hasPreviousPage: boolean,
        +hasNextPage: boolean,
      |},
    |}
  |}
|};
export type TransactionOutputPagingTableQuery = {|
  variables: TransactionOutputPagingTableQueryVariables,
  response: TransactionOutputPagingTableQueryResponse,
|};
*/


/*
query TransactionOutputPagingTableQuery(
  $hash: String!
  $first: Int!
  $after: String
) {
  transaction(hash: $hash) {
    outputs(first: $first, after: $after, orderBy: [{name: "transaction_input_output.output_transaction_index", direction: "ASC NULLS LAST"}]) {
      edges {
        node {
          ...TransactionOutputTable_outputs
          id
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
      }
    }
    id
  }
}

fragment TransactionOutputTable_outputs on TransactionInputOutput {
  ...TransactionInputOutputTable_input_outputs
  input_transaction_hash
}

fragment TransactionInputOutputTable_input_outputs on TransactionInputOutput {
  address_id
  value
  asset {
    ...AssetNameLink_asset
    id
  }
}

fragment AssetNameLink_asset on Asset {
  id
  symbol
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
v2 = [
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
        "direction": "ASC NULLS LAST",
        "name": "transaction_input_output.output_transaction_index"
      }
    ],
    "type": "[OrderByInput!]"
  }
],
v3 = {
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
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "TransactionOutputPagingTableQuery",
  "id": "23",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "TransactionOutputPagingTableQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transaction",
        "storageKey": null,
        "args": v1,
        "concreteType": "Transaction",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "outputs",
            "storageKey": null,
            "args": v2,
            "concreteType": "TransactionToOutputsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "TransactionToOutputsEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "TransactionInputOutput",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "FragmentSpread",
                        "name": "TransactionOutputTable_outputs",
                        "args": null
                      }
                    ]
                  }
                ]
              },
              v3
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "TransactionOutputPagingTableQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transaction",
        "storageKey": null,
        "args": v1,
        "concreteType": "Transaction",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "outputs",
            "storageKey": null,
            "args": v2,
            "concreteType": "TransactionToOutputsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "TransactionToOutputsEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "TransactionInputOutput",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "address_id",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "value",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "asset",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "Asset",
                        "plural": false,
                        "selections": [
                          v4,
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "symbol",
                            "args": null,
                            "storageKey": null
                          }
                        ]
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "input_transaction_hash",
                        "args": null,
                        "storageKey": null
                      },
                      v4
                    ]
                  }
                ]
              },
              v3
            ]
          },
          v4
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '2805848e4f4b51f3b9d4e1ee0e9610c1';
module.exports = node;
