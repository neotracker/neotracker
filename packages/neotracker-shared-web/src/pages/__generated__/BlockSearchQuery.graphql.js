/**
 * @flow
 * @relayHash 6e45f7c26fc5e69a32f847ecc7eea3f9
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type BlockPagingView_blocks$ref = any;
export type BlockSearchQueryVariables = {|
  first: number,
  after?: ?string,
|};
export type BlockSearchQueryResponse = {|
  +blocks: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +$fragmentRefs: BlockPagingView_blocks$ref
      |}
    |}>,
    +pageInfo: {|
      +hasNextPage: boolean
    |},
  |}
|};
export type BlockSearchQuery = {|
  variables: BlockSearchQueryVariables,
  response: BlockSearchQueryResponse,
|};
*/


/*
query BlockSearchQuery(
  $first: Int!
  $after: String
) {
  blocks(orderBy: [{name: "block.id", direction: "desc"}], first: $first, after: $after) {
    edges {
      node {
        ...BlockPagingView_blocks
        id
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}

fragment BlockPagingView_blocks on Block {
  ...BlockTable_blocks
}

fragment BlockTable_blocks on Block {
  id
  time
  transaction_count
  validator_address_id
  size
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
        "name": "block.id"
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
  "name": "BlockSearchQuery",
  "id": "13",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "BlockSearchQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "blocks",
        "storageKey": null,
        "args": v1,
        "concreteType": "BlocksConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "BlocksEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Block",
                "plural": false,
                "selections": [
                  {
                    "kind": "FragmentSpread",
                    "name": "BlockPagingView_blocks",
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
    "name": "BlockSearchQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "blocks",
        "storageKey": null,
        "args": v1,
        "concreteType": "BlocksConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "BlocksEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Block",
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
                    "name": "time",
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
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "validator_address_id",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "size",
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
(node/*: any*/).hash = '6688219afee81069bf3d564ccafc8307';
module.exports = node;
