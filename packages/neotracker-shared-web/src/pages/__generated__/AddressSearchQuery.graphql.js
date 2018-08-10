/**
 * @flow
 * @relayHash 19eba039c46d8cbafd5e030d2c4041fb
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type AddressPagingView_addresses$ref = any;
type CoinTable_coins$ref = any;
export type AddressSearchQueryVariables = {|
  first: number,
  after?: ?string,
|};
export type AddressSearchQueryResponse = {|
  +addresses: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +id: string,
        +coins: {|
          +edges: $ReadOnlyArray<{|
            +node: {|
              +value: string,
              +asset: {|
                +id: string,
                +symbol: string,
              |},
              +$fragmentRefs: CoinTable_coins$ref,
            |}
          |}>
        |},
        +$fragmentRefs: AddressPagingView_addresses$ref,
      |}
    |}>,
    +pageInfo: {|
      +hasNextPage: boolean
    |},
  |}
|};
export type AddressSearchQuery = {|
  variables: AddressSearchQueryVariables,
  response: AddressSearchQueryResponse,
|};
*/


/*
query AddressSearchQuery(
  $first: Int!
  $after: String
) {
  addresses(orderBy: [{name: "address.block_id", direction: "desc"}, {name: "address.id", direction: "asc"}], first: $first, after: $after) {
    edges {
      node {
        ...AddressPagingView_addresses
        id
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
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}

fragment AddressPagingView_addresses on Address {
  ...AddressTable_addresses
}

fragment CoinTable_coins on Coin {
  value
  asset {
    id
    symbol
  }
}

fragment AddressTable_addresses on Address {
  id
  transaction_hash
  block_time
  last_transaction_hash
  last_transaction_time
  transaction_count
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
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
        "name": "address.block_id"
      },
      {
        "direction": "asc",
        "name": "address.id"
      }
    ],
    "type": "[OrderByInput!]"
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
  "name": "value",
  "args": null,
  "storageKey": null
},
v4 = {
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
v5 = {
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
      "name": "hasNextPage",
      "args": null,
      "storageKey": null
    }
  ]
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "AddressSearchQuery",
  "id": "32",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "AddressSearchQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "addresses",
        "storageKey": null,
        "args": v1,
        "concreteType": "AddressesConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "AddressesEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Address",
                "plural": false,
                "selections": [
                  {
                    "kind": "FragmentSpread",
                    "name": "AddressPagingView_addresses",
                    "args": null
                  },
                  v2,
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
                              {
                                "kind": "FragmentSpread",
                                "name": "CoinTable_coins",
                                "args": null
                              },
                              v3,
                              v4
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          v5
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "AddressSearchQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "addresses",
        "storageKey": null,
        "args": v1,
        "concreteType": "AddressesConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "AddressesEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Address",
                "plural": false,
                "selections": [
                  v2,
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "transaction_hash",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "block_time",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "last_transaction_hash",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "last_transaction_time",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "transaction_count",
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
                            "selections": [
                              v3,
                              v4,
                              v2
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          v5
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'f393a032080f1d13e44a484710244ff9';
module.exports = node;
