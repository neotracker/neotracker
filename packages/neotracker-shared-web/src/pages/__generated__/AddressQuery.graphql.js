/**
 * @flow
 * @relayHash 2ae25838482df87de9f352fe7b0802b8
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type AddressView_address$ref = any;
export type AddressQueryVariables = {|
  hash: string,
|};
export type AddressQueryResponse = {|
  +address: ?{|
    +hash: string,
    +$fragmentRefs: AddressView_address$ref,
  |},
|};
*/


/*
query AddressQuery(
  $hash: String!
) {
  address(hash: $hash) {
    hash
    ...AddressView_address
    id
  }
}

fragment AddressView_address on Address {
  ...AddressViewExtra_address
  hash
  transaction_hash
  block_time
  transaction_count
  transfer_count
  coins {
    edges {
      node {
        ...CoinTable_coins
        value
        asset {
          hash
          symbol
          id
        }
        id
      }
    }
  }
  claim_value_available_coin {
    ...Coin_coin
    id
  }
}

fragment AddressViewExtra_address on Address {
  hash
  first_transaction {
    ...TransactionSummary_transaction
    id
  }
  ...AddressTransactionPagingView_address
  ...AddressTransferPagingView_address
}

fragment CoinTable_coins on Coin {
  value
  asset {
    hash
    symbol
    id
  }
}

fragment Coin_coin on Coin {
  value
  asset {
    hash
    symbol
    id
  }
}

fragment TransactionSummary_transaction on Transaction {
  hash
  ...TransactionSummaryHeader_transaction
}

fragment AddressTransactionPagingView_address on Address {
  hash
}

fragment AddressTransferPagingView_address on Address {
  hash
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
  "name": "hash",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "block_time",
  "args": null,
  "storageKey": null
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v5 = [
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
      },
      v4
    ]
  },
  v4
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "AddressQuery",
  "id": "33",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "AddressQuery",
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
            "kind": "FragmentSpread",
            "name": "AddressView_address",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "AddressQuery",
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
            "name": "first_transaction",
            "storageKey": null,
            "args": null,
            "concreteType": "Transaction",
            "plural": false,
            "selections": [
              v2,
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "type",
                "args": null,
                "storageKey": null
              },
              v3,
              v4
            ]
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "transaction_hash",
            "args": null,
            "storageKey": null
          },
          v3,
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
            "name": "transfer_count",
            "args": null,
            "storageKey": null
          },
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
                    "selections": v5
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
            "selections": v5
          },
          v4
        ]
      }
    ]
  }
};
})();
(node/*: any*/).hash = 'd991d9fcd9c4c08fff797d759204541a';
module.exports = node;
