/**
 * @flow
 * @relayHash 4ed773723f88abd1dd3d07c750d411ae
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type AssetView_asset$ref = any;
export type AssetQueryVariables = {|
  hash: string
|};
export type AssetQueryResponse = {|
  +asset: ?{|
    +id: string,
    +symbol: string,
    +$fragmentRefs: AssetView_asset$ref,
  |}
|};
export type AssetQuery = {|
  variables: AssetQueryVariables,
  response: AssetQueryResponse,
|};
*/


/*
query AssetQuery(
  $hash: String!
) {
  asset(hash: $hash) {
    id
    symbol
    ...AssetView_asset
  }
}

fragment AssetView_asset on Asset {
  id
  transaction_hash
  type
  symbol
  name {
    lang
    name
  }
  amount
  issued
  available
  precision
  admin_address_id
  block_time
  transaction_count
  address_count
  transfer_count
  ...AssetViewExtra_asset
}

fragment AssetViewExtra_asset on Asset {
  type
  register_transaction {
    ...TransactionSummary_transaction
    id
  }
  ...AssetTransactionPagingView_asset
  ...AssetTransferPagingView_asset
  ...AssetAddressPagingView_asset
}

fragment TransactionSummary_transaction on Transaction {
  hash
  ...TransactionSummaryHeader_transaction
}

fragment AssetTransactionPagingView_asset on Asset {
  id
}

fragment AssetTransferPagingView_asset on Asset {
  id
}

fragment AssetAddressPagingView_asset on Asset {
  id
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
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "symbol",
  "args": null,
  "storageKey": null
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "type",
  "args": null,
  "storageKey": null
},
v5 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "block_time",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "AssetQuery",
  "id": "10",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "AssetQuery",
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
          v3,
          {
            "kind": "FragmentSpread",
            "name": "AssetView_asset",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "AssetQuery",
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
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "available",
            "args": null,
            "storageKey": null
          },
          v2,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "transaction_hash",
            "args": null,
            "storageKey": null
          },
          v4,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "name",
            "storageKey": null,
            "args": null,
            "concreteType": "AssetName",
            "plural": true,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "lang",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "name",
                "args": null,
                "storageKey": null
              }
            ]
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "amount",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "issued",
            "args": null,
            "storageKey": null
          },
          v3,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "precision",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "admin_address_id",
            "args": null,
            "storageKey": null
          },
          v5,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "transaction_count",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "address_count",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "transfer_count",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "register_transaction",
            "storageKey": null,
            "args": null,
            "concreteType": "Transaction",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "hash",
                "args": null,
                "storageKey": null
              },
              v4,
              v5,
              v2
            ]
          }
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '34d2ec6a309946235e640aa255f6323b';
module.exports = node;
