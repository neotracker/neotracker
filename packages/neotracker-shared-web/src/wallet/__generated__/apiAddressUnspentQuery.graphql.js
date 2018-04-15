/**
 * @flow
 * @relayHash b4ae69a2fb94b9bd84616bc07e7cdfd8
 */

/* eslint-disable */

'use strict';

/*::
import type {ConcreteBatch} from 'relay-runtime';
export type apiAddressUnspentQueryResponse = {|
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
query apiAddressUnspentQuery(
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
    "name": "apiAddressUnspentQuery",
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
  "id": "13",
  "kind": "Batch",
  "metadata": {},
  "name": "apiAddressUnspentQuery",
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
    "name": "apiAddressUnspentQuery",
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
  batch['text'] = "query apiAddressUnspentQuery(\n  $hash: String!\n  $filters: [FilterInput!]!\n) {\n  address(hash: $hash) {\n    transaction_input_outputs(filters: $filters) {\n      edges {\n        node {\n          value\n          address_hash\n          asset_hash\n          output_transaction_index\n          output_transaction_hash\n          input_transaction_hash\n          id\n        }\n      }\n    }\n    id\n  }\n}\n";
}

module.exports = batch;
