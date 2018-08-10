/**
 * @flow
 * @relayHash 8b2dcc43cb7aba179af165cfa8f08adc
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type ContractPagingView_contracts$ref = any;
export type ContractSearchQueryVariables = {|
  first: number,
  after?: ?string,
|};
export type ContractSearchQueryResponse = {|
  +contracts: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +$fragmentRefs: ContractPagingView_contracts$ref
      |}
    |}>,
    +pageInfo: {|
      +hasPreviousPage: boolean,
      +hasNextPage: boolean,
    |},
  |}
|};
export type ContractSearchQuery = {|
  variables: ContractSearchQueryVariables,
  response: ContractSearchQueryResponse,
|};
*/


/*
query ContractSearchQuery(
  $first: Int!
  $after: String
) {
  contracts(orderBy: [{name: "contract.block_id", direction: "desc"}, {name: "contract.id", direction: "desc"}], first: $first, after: $after) {
    edges {
      node {
        ...ContractPagingView_contracts
        id
      }
    }
    pageInfo {
      hasPreviousPage
      hasNextPage
    }
  }
}

fragment ContractPagingView_contracts on Contract {
  ...ContractTable_contracts
}

fragment ContractTable_contracts on Contract {
  id
  name
  author
  transaction_hash
  block_time
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
        "name": "contract.block_id"
      },
      {
        "direction": "desc",
        "name": "contract.id"
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
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "ContractSearchQuery",
  "id": "11",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "ContractSearchQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "contracts",
        "storageKey": null,
        "args": v1,
        "concreteType": "ContractsConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "ContractsEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Contract",
                "plural": false,
                "selections": [
                  {
                    "kind": "FragmentSpread",
                    "name": "ContractPagingView_contracts",
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
    "name": "ContractSearchQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "contracts",
        "storageKey": null,
        "args": v1,
        "concreteType": "ContractsConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "ContractsEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Contract",
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
                    "name": "name",
                    "args": null,
                    "storageKey": null
                  },
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "author",
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
(node/*: any*/).hash = '49137734fa329ca563e9d6e498bfd773';
module.exports = node;
