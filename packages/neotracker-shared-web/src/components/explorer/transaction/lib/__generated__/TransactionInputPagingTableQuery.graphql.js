/**
 * @flow
 * @relayHash d7585436aeb3a02b036f171933aa5010
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type TransactionInputTable_inputs$ref = any;
export type TransactionInputPagingTableQueryVariables = {|
  hash: string,
  first: number,
  after?: ?string,
|};
export type TransactionInputPagingTableQueryResponse = {|
  +transaction: ?{|
    +inputs: {|
      +edges: $ReadOnlyArray<{|
        +node: {|
          +$fragmentRefs: TransactionInputTable_inputs$ref
        |}
      |}>,
      +pageInfo: {|
        +hasPreviousPage: boolean,
        +hasNextPage: boolean,
      |},
    |}
  |}
|};
export type TransactionInputPagingTableQuery = {|
  variables: TransactionInputPagingTableQueryVariables,
  response: TransactionInputPagingTableQueryResponse,
|};
*/


/*
query TransactionInputPagingTableQuery(
  $hash: String!
  $first: Int!
  $after: String
) {
  transaction(hash: $hash) {
    inputs(first: $first, after: $after, orderBy: [{name: "transaction_input_output.output_transaction_index", direction: "asc"}]) {
      edges {
        node {
          ...TransactionInputTable_inputs
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

fragment TransactionInputTable_inputs on TransactionInputOutput {
  ...TransactionInputOutputTable_input_outputs
  output_transaction_hash
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
        "direction": "asc",
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
  "name": "TransactionInputPagingTableQuery",
  "id": "9",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "TransactionInputPagingTableQuery",
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
            "name": "inputs",
            "storageKey": null,
            "args": v2,
            "concreteType": "TransactionToInputsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "TransactionToInputsEdge",
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
                        "name": "TransactionInputTable_inputs",
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
    "name": "TransactionInputPagingTableQuery",
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
            "name": "inputs",
            "storageKey": null,
            "args": v2,
            "concreteType": "TransactionToInputsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "TransactionToInputsEdge",
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
                        "name": "output_transaction_hash",
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
(node/*: any*/).hash = '3eb64677838705104a30aa1c4d0bc091';
module.exports = node;
