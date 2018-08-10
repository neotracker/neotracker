/**
 * @flow
 * @relayHash 043f2cbd787bf187a571b2d1c3155dac
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type AddressView_address$ref = any;
export type AddressQueryVariables = {|
  hash: string
|};
export type AddressQueryResponse = {|
  +address: ?{|
    +$fragmentRefs: AddressView_address$ref
  |}
|};
export type AddressQuery = {|
  variables: AddressQueryVariables,
  response: AddressQueryResponse,
|};
*/


/*
query AddressQuery(
  $hash: String!
) {
  address(hash: $hash) {
    ...AddressView_address
    id
  }
}

fragment AddressView_address on Address {
  ...AddressViewExtra_address
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
          id
          symbol
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
  id
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
    id
    symbol
  }
}

fragment Coin_coin on Coin {
  value
  asset {
    id
    symbol
  }
}

fragment TransactionSummary_transaction on Transaction {
  hash
  ...TransactionSummaryHeader_transaction
}

fragment AddressTransactionPagingView_address on Address {
  id
}

fragment AddressTransferPagingView_address on Address {
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
  "name": "block_time",
  "args": null,
  "storageKey": null
},
v4 = [
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
  v2
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "AddressQuery",
  "id": "12",
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
              v3,
              v2
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
                    "selections": v4
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
            "selections": v4
          }
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '51c3731b6bd28ae1927cbd3bb77c025b';
module.exports = node;
