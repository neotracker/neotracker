/**
 * @flow
 * @relayHash 82338f5ba41a5b5c9759bf8b7f51e1c0
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type TransferPagingView_transfers$ref = any;
export type AddressTransferPagingViewQueryVariables = {|
  hash: string,
  first: number,
  after?: ?string,
|};
export type AddressTransferPagingViewQueryResponse = {|
  +address: ?{|
    +id: string,
    +transfers: {|
      +edges: $ReadOnlyArray<{|
        +node: {|
          +$fragmentRefs: TransferPagingView_transfers$ref
        |}
      |}>,
      +pageInfo: {|
        +hasPreviousPage: boolean,
        +hasNextPage: boolean,
      |},
    |},
  |}
|};
*/


/*
query AddressTransferPagingViewQuery(
  $hash: String!
  $first: Int!
  $after: String
) {
  address(hash: $hash) {
    id
    transfers(first: $first, after: $after, orderBy: [{name: "transfer.block_index", direction: "desc nulls first"}, {name: "transfer.transaction_index", direction: "desc nulls first"}, {name: "transfer.action_index", direction: "desc nulls first"}]) {
      edges {
        node {
          ...TransferPagingView_transfers
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

fragment TransferPagingView_transfers on Transfer {
  ...TransferTable_transfers
}

fragment TransferTable_transfers on Transfer {
  ...TransferLink_transfer
  from_address_id
  to_address_id
  value
  asset {
    ...AssetNameLink_asset
    id
  }
  block_time
}

fragment TransferLink_transfer on Transfer {
  transaction_id
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
        "direction": "desc nulls first",
        "name": "transfer.block_index"
      },
      {
        "direction": "desc nulls first",
        "name": "transfer.transaction_index"
      },
      {
        "direction": "desc nulls first",
        "name": "transfer.action_index"
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
  "name": "AddressTransferPagingViewQuery",
  "id": "10",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "AddressTransferPagingViewQuery",
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
            "name": "transfers",
            "storageKey": null,
            "args": v3,
            "concreteType": "AddressToTransfersConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "AddressToTransfersEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "Transfer",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "FragmentSpread",
                        "name": "TransferPagingView_transfers",
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
    "name": "AddressTransferPagingViewQuery",
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
            "name": "transfers",
            "storageKey": null,
            "args": v3,
            "concreteType": "AddressToTransfersConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "AddressToTransfersEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "Transfer",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "transaction_id",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "from_address_id",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "to_address_id",
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
                          v2,
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
                        "name": "block_time",
                        "args": null,
                        "storageKey": null
                      },
                      v2
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
(node/*: any*/).hash = '20270f35a4ecdfb5a904c6cb34c829ff';
module.exports = node;
