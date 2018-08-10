/**
 * @flow
 * @relayHash 599df0f01562eeab9790a23512ab489d
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type AddressPagingView_addresses$ref = any;
type Coin_coin$ref = any;
export type AssetAddressPagingViewQueryVariables = {|
  hash: string,
  first: number,
  after?: ?string,
|};
export type AssetAddressPagingViewQueryResponse = {|
  +asset: ?{|
    +id: string,
    +coins: {|
      +edges: $ReadOnlyArray<{|
        +node: {|
          +id: string,
          +value: string,
          +address: {|
            +id: string,
            +$fragmentRefs: AddressPagingView_addresses$ref,
          |},
          +$fragmentRefs: Coin_coin$ref,
        |}
      |}>,
      +pageInfo: {|
        +hasNextPage: boolean,
        +endCursor: ?string,
      |},
    |},
  |}
|};
export type AssetAddressPagingViewQuery = {|
  variables: AssetAddressPagingViewQueryVariables,
  response: AssetAddressPagingViewQueryResponse,
|};
*/


/*
query AssetAddressPagingViewQuery(
  $hash: String!
  $first: Int!
  $after: String
) {
  asset(hash: $hash) {
    id
    coins(first: $first, after: $after, orderBy: [{name: "coin.value", direction: "desc"}, {name: "coin.id", direction: "desc"}]) {
      edges {
        node {
          ...Coin_coin
          id
          value
          address {
            id
            ...AddressPagingView_addresses
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}

fragment Coin_coin on Coin {
  value
  asset {
    id
    symbol
  }
}

fragment AddressPagingView_addresses on Address {
  ...AddressTable_addresses
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
        "direction": "desc",
        "name": "coin.value"
      },
      {
        "direction": "desc",
        "name": "coin.id"
      }
    ],
    "type": "[OrderByInput!]"
  }
],
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "value",
  "args": null,
  "storageKey": null
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
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "endCursor",
      "args": null,
      "storageKey": null
    }
  ]
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "AssetAddressPagingViewQuery",
  "id": "48",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "AssetAddressPagingViewQuery",
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
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "coins",
            "storageKey": null,
            "args": v3,
            "concreteType": "AssetToCoinsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "AssetToCoinsEdge",
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
                        "name": "Coin_coin",
                        "args": null
                      },
                      v2,
                      v4,
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "address",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "Address",
                        "plural": false,
                        "selections": [
                          v2,
                          {
                            "kind": "FragmentSpread",
                            "name": "AddressPagingView_addresses",
                            "args": null
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
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "AssetAddressPagingViewQuery",
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
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "coins",
            "storageKey": null,
            "args": v3,
            "concreteType": "AssetToCoinsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "AssetToCoinsEdge",
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
                      v4,
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
                      v2,
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "address",
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
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'b2a4ce85cf41d3041da37a0910bb16e7';
module.exports = node;
