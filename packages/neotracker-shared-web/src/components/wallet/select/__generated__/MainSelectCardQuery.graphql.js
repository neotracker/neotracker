/**
 * @flow
 * @relayHash 31aed2e02aadc88f552025c8a46bdd4f
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type SelectCard_address$ref = any;
export type MainSelectCardQueryVariables = {|
  hash: string
|};
export type MainSelectCardQueryResponse = {|
  +address: ?{|
    +$fragmentRefs: SelectCard_address$ref
  |}
|};
export type MainSelectCardQuery = {|
  variables: MainSelectCardQueryVariables,
  response: MainSelectCardQueryResponse,
|};
*/


/*
query MainSelectCardQuery(
  $hash: String!
) {
  address(hash: $hash) {
    ...SelectCard_address
    id
  }
}

fragment SelectCard_address on Address {
  ...AccountView_address
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
  "name": "MainSelectCardQuery",
  "id": "3",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "MainSelectCardQuery",
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
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "MainSelectCardQuery",
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
(node/*: any*/).hash = 'da11af964d40c0563ed417ad4167a082';
module.exports = node;
