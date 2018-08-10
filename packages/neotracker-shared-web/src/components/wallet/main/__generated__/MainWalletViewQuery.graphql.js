/**
 * @flow
 * @relayHash 7d64d178e13264e9b127cd74346eb943
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type SelectCard_address$ref = any;
type TransferCard_address$ref = any;
type WalletTransactionsCard_address$ref = any;
type WalletTransfersCard_address$ref = any;
export type MainWalletViewQueryVariables = {|
  hash: string
|};
export type MainWalletViewQueryResponse = {|
  +address: ?{|
    +$fragmentRefs: SelectCard_address$ref & TransferCard_address$ref & WalletTransactionsCard_address$ref & WalletTransfersCard_address$ref
  |}
|};
export type MainWalletViewQuery = {|
  variables: MainWalletViewQueryVariables,
  response: MainWalletViewQueryResponse,
|};
*/


/*
query MainWalletViewQuery(
  $hash: String!
) {
  address(hash: $hash) {
    ...SelectCard_address
    ...TransferCard_address
    ...WalletTransactionsCard_address
    ...WalletTransfersCard_address
    id
  }
}

fragment SelectCard_address on Address {
  ...AccountView_address
}

fragment TransferCard_address on Address {
  ...TransferView_address
}

fragment WalletTransactionsCard_address on Address {
  ...AddressTransactionPagingView_address
}

fragment WalletTransfersCard_address on Address {
  ...AddressTransferPagingView_address
}

fragment AddressTransferPagingView_address on Address {
  id
}

fragment AddressTransactionPagingView_address on Address {
  id
}

fragment TransferView_address on Address {
  ...SendTransaction_address
}

fragment SendTransaction_address on Address {
  coins {
    edges {
      node {
        value
        asset {
          type
          id
          precision
          symbol
        }
        id
      }
    }
  }
}

fragment AccountView_address on Address {
  ...AccountViewBase_address
}

fragment AccountViewBase_address on Address {
  coins {
    edges {
      node {
        ...CoinTable_coins
        id
      }
    }
  }
  claim_value_available_coin {
    value
    id
  }
}

fragment CoinTable_coins on Coin {
  value
  asset {
    id
    symbol
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "hash",
    "type": "String!",
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
  "name": "value",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "MainWalletViewQuery",
  "id": "18",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "MainWalletViewQuery",
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
          {
            "kind": "FragmentSpread",
            "name": "SelectCard_address",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "TransferCard_address",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "WalletTransactionsCard_address",
            "args": null
          },
          {
            "kind": "FragmentSpread",
            "name": "WalletTransfersCard_address",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "MainWalletViewQuery",
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
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "coins",
            "storageKey": null,
            "args": null,
            "concreteType": "AddressToCoinsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "AddressToCoinsEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "Coin",
                    "plural": false,
                    "selections": [
                      v2,
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "asset",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "Asset",
                        "plural": false,
                        "selections": [
                          v3,
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "symbol",
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
                            "name": "precision",
                            "args": null,
                            "storageKey": null
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
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "claim_value_available_coin",
            "storageKey": null,
            "args": null,
            "concreteType": "Coin",
            "plural": false,
            "selections": [
              v2,
              v3
            ]
          },
          v3
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '647fdbf3ddc446138a9c15d55a74d0b9';
module.exports = node;
