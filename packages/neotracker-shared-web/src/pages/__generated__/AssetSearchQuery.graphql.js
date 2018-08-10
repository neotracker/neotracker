/**
 * @flow
 * @relayHash 046870c1d2dfcaafc52cb3a102f05682
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type AssetPagingView_assets$ref = any;
export type AssetSearchQueryVariables = {|
  first: number,
  after?: ?string,
|};
export type AssetSearchQueryResponse = {|
  +assets: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +$fragmentRefs: AssetPagingView_assets$ref
      |}
    |}>,
    +pageInfo: {|
      +hasNextPage: boolean
    |},
  |}
|};
export type AssetSearchQuery = {|
  variables: AssetSearchQueryVariables,
  response: AssetSearchQueryResponse,
|};
*/


/*
query AssetSearchQuery(
  $first: Int!
  $after: String
) {
  assets(orderBy: [{name: "asset.transaction_count", direction: "desc"}, {name: "asset.id", direction: "asc"}], first: $first, after: $after, filters: [{name: "asset.id", operator: "!=", value: "cb453a56856a236cbae8b8f937db308a15421daada4ba6ce78123b59bfb7253c"}, {name: "asset.id", operator: "!=", value: "6161af8875eb78654e385a33e7334a473a2a0519281d33c06780ff3c8bce15ea"}]) {
    edges {
      node {
        ...AssetPagingView_assets
        id
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}

fragment AssetPagingView_assets on Asset {
  ...AssetTable_assets
}

fragment AssetTable_assets on Asset {
  ...AssetNameLink_asset
  type
  amount
  issued
  transaction_hash
  block_time
  address_count
  transaction_count
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
    "kind": "Literal",
    "name": "filters",
    "value": [
      {
        "name": "asset.id",
        "operator": "!=",
        "value": "cb453a56856a236cbae8b8f937db308a15421daada4ba6ce78123b59bfb7253c"
      },
      {
        "name": "asset.id",
        "operator": "!=",
        "value": "6161af8875eb78654e385a33e7334a473a2a0519281d33c06780ff3c8bce15ea"
      }
    ],
    "type": "[FilterInput!]"
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
        "name": "asset.transaction_count"
      },
      {
        "direction": "asc",
        "name": "asset.id"
      }
    ],
    "type": "[OrderByInput!]"
  }
],
v2 = {
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
  "name": "AssetSearchQuery",
  "id": "17",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "AssetSearchQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "assets",
        "storageKey": null,
        "args": v1,
        "concreteType": "AssetsConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "AssetsEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Asset",
                "plural": false,
                "selections": [
                  {
                    "kind": "FragmentSpread",
                    "name": "AssetPagingView_assets",
                    "args": null
                  }
                ]
              }
            ]
          },
          v2
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "AssetSearchQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "assets",
        "storageKey": null,
        "args": v1,
        "concreteType": "AssetsConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "AssetsEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Asset",
                "plural": false,
                "selections": [
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "id",
                    "args": null,
                    "storageKey": null
                  },
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
                    "name": "address_count",
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
          },
          v2
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '3ecfd4b96256e4f43f120ae4d2fac0ae';
module.exports = node;
