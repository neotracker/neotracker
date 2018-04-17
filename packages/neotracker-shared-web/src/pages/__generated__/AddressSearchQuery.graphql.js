/**
 * @flow
 * @relayHash ebc566fc2c775326c36bf57c95b604d4
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
              +$fragmentRefs: CoinTable_coins$ref,
            |},
          |}>,
        |},
        +$fragmentRefs: AddressPagingView_addresses$ref,
      |},
    |}>,
    +pageInfo: {|
      +hasNextPage: boolean,
    |},
  |},
|};
*/


/*
query AddressSearchQuery(
  $first: Int!
  $after: String
) {
  addresses(orderBy: [{name: "address.block_time", direction: "desc nulls first"}, {name: "address.id", direction: "desc nulls last"}], first: $first, after: $after) {
    edges {
      node {
        ...AddressPagingView_addresses
        id
        coins {
          edges {
            node {
              ...CoinTable_coins
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
  transaction_id
  block_time
  last_transaction_id
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
        "direction": "desc nulls first",
        "name": "address.block_time"
      },
      {
        "direction": "desc nulls last",
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
  "id": "23",
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
                              }
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
          v3
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
                    "name": "transaction_id",
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
                    "name": "last_transaction_id",
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
          v3
        ]
      }
    ]
  }
};
})();
(node/*: any*/).hash = '333ec241a076d27a42437e8e51aa3e30';
module.exports = node;
