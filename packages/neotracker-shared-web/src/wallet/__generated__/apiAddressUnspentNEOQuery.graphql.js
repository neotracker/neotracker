/**
 * @flow
 * @relayHash 05ca37b550b14e337bdf78ece6b775a3
 */

/* eslint-disable */

'use strict';

/*::
import type {ConcreteBatch} from 'relay-runtime';
export type apiAddressUnspentNEOQueryResponse = {|
  +address: ?{|
    +transaction_input_outputs: {|
      +edges: $ReadOnlyArray<{|
        +node: {|
          +value: string;
          +address_hash: string;
          +asset_hash: string;
          +output_transaction_index: number;
          +output_transaction_hash: string;
          +input_transaction_hash: ?string;
        |};
      |}>;
    |};
  |};
|};
*/


/*
query apiAddressUnspentNEOQuery(
  $hash: String!
  $filters: [FilterInput!]!
) {
  address(hash: $hash) {
    transaction_input_outputs(filters: $filters) {
      edges {
        node {
          value
          address_hash
          asset_hash
          output_transaction_index
          output_transaction_hash
          input_transaction_hash
          id
        }
      }
    }
    id
  }
}
*/

const batch /*: ConcreteBatch*/ = {
  "fragment": {
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "hash",
        "type": "String!",
        "defaultValue": null
      },
      {
        "kind": "LocalArgument",
        "name": "filters",
        "type": "[FilterInput!]!",
        "defaultValue": null
      }
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "apiAddressUnspentNEOQuery",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "hash",
            "variableName": "hash",
            "type": "String!"
          }
        ],
        "concreteType": "Address",
        "name": "address",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "args": [
              {
                "kind": "Variable",
                "name": "filters",
                "variableName": "filters",
                "type": "[FilterInput!]"
              }
            ],
            "concreteType": "AddressToTransactionInputOutputsConnection",
            "name": "transaction_input_outputs",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "args": null,
                "concreteType": "AddressToTransactionInputOutputsEdge",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "args": null,
                    "concreteType": "TransactionInputOutput",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "value",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "address_hash",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "asset_hash",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "output_transaction_index",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "output_transaction_hash",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "input_transaction_hash",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query"
  },
  "id": "14",
  "kind": "Batch",
  "metadata": {},
  "name": "apiAddressUnspentNEOQuery",
  "query": {
    "argumentDefinitions": [
      {
        "kind": "LocalArgument",
        "name": "hash",
        "type": "String!",
        "defaultValue": null
      },
      {
        "kind": "LocalArgument",
        "name": "filters",
        "type": "[FilterInput!]!",
        "defaultValue": null
      }
    ],
    "kind": "Root",
    "name": "apiAddressUnspentNEOQuery",
    "operation": "query",
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "hash",
            "variableName": "hash",
            "type": "String!"
          }
        ],
        "concreteType": "Address",
        "name": "address",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "args": [
              {
                "kind": "Variable",
                "name": "filters",
                "variableName": "filters",
                "type": "[FilterInput!]"
              }
            ],
            "concreteType": "AddressToTransactionInputOutputsConnection",
            "name": "transaction_input_outputs",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "args": null,
                "concreteType": "AddressToTransactionInputOutputsEdge",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "args": null,
                    "concreteType": "TransactionInputOutput",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "value",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "address_hash",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "asset_hash",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "output_transaction_index",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "output_transaction_hash",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "input_transaction_hash",
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "args": null,
                        "name": "id",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "args": null,
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "text": null
};


if (__DEV__) {
  batch['text'] = "query apiAddressUnspentNEOQuery(\n  $hash: String!\n  $filters: [FilterInput!]!\n) {\n  address(hash: $hash) {\n    transaction_input_outputs(filters: $filters) {\n      edges {\n        node {\n          value\n          address_hash\n          asset_hash\n          output_transaction_index\n          output_transaction_hash\n          input_transaction_hash\n          id\n        }\n      }\n    }\n    id\n  }\n}\n";
}

module.exports = batch;
