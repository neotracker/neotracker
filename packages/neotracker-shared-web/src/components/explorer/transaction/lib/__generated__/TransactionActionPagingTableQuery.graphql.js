/**
 * @flow
 * @relayHash f87229ba3f567a272d978849e4ef67f7
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type ActionTable_actions$ref = any;
export type TransactionActionPagingTableQueryVariables = {|
  hash: string,
  first: number,
  after?: ?string,
|};
export type TransactionActionPagingTableQueryResponse = {|
  +transaction: ?{|
    +actions: {|
      +edges: $ReadOnlyArray<{|
        +node: {|
          +$fragmentRefs: ActionTable_actions$ref
        |}
      |}>,
      +pageInfo: {|
        +hasPreviousPage: boolean,
        +hasNextPage: boolean,
      |},
    |}
  |}
|};
export type TransactionActionPagingTableQuery = {|
  variables: TransactionActionPagingTableQueryVariables,
  response: TransactionActionPagingTableQueryResponse,
|};
*/


/*
query TransactionActionPagingTableQuery(
  $hash: String!
  $first: Int!
  $after: String
) {
  transaction(hash: $hash) {
    actions(first: $first, after: $after, orderBy: [{name: "action.index", direction: "asc"}]) {
      edges {
        node {
          ...ActionTable_actions
          id
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
      }
    }
    id
  }
}

fragment ActionTable_actions on Action {
  id
  type
  ...LogItem_action
  ...NotificationItem_action
}

fragment LogItem_action on Action {
  ...ActionItem_action
  message
}

fragment NotificationItem_action on Action {
  ...ActionItem_action
  message
  args_raw
  transfer {
    ...TransferItem_transfer
    id
  }
}

fragment ActionItem_action on Action {
  index
}

fragment TransferItem_transfer on Transfer {
  from_address_id
  to_address_id
  value
  asset {
    ...AssetNameLink_asset
    id
  }
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
v2 = [
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
        "direction": "asc",
        "name": "action.index"
      }
    ],
    "type": "[OrderByInput!]"
  }
],
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
      "name": "hasPreviousPage",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "hasNextPage",
      "args": null,
      "storageKey": null
    }
  ]
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "TransactionActionPagingTableQuery",
  "id": "7",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "TransactionActionPagingTableQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transaction",
        "storageKey": null,
        "args": v1,
        "concreteType": "Transaction",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "actions",
            "storageKey": null,
            "args": v2,
            "concreteType": "TransactionToActionsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "TransactionToActionsEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "Action",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "FragmentSpread",
                        "name": "ActionTable_actions",
                        "args": null
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
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "TransactionActionPagingTableQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transaction",
        "storageKey": null,
        "args": v1,
        "concreteType": "Transaction",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "actions",
            "storageKey": null,
            "args": v2,
            "concreteType": "TransactionToActionsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "TransactionToActionsEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "Action",
                    "plural": false,
                    "selections": [
                      v4,
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
                        "name": "index",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "message",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "args_raw",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "transfer",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "Transfer",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "from_address_id",
                            "args": null,
                            "storageKey": null
                          },
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "to_address_id",
                            "args": null,
                            "storageKey": null
                          },
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
                              v4,
                              {
                                "kind": "ScalarField",
                                "alias": null,
                                "name": "symbol",
                                "args": null,
                                "storageKey": null
                              }
                            ]
                          },
                          v4
                        ]
                      }
                    ]
                  }
                ]
              },
              v3
            ]
          },
          v4
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'c0cdce609bc8f1b92c501f0ae49d1351';
module.exports = node;
