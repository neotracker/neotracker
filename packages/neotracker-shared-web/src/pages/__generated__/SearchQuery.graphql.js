/**
 * @flow
 * @relayHash cbb0f5be6c637956a6c275528ae36364
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type SearchQueryVariables = {|
  value: string,
  index?: ?number,
|};
export type SearchQueryResponse = {|
  +address: ?{|
    +id: string
  |},
  +asset: ?{|
    +id: string
  |},
  +block: ?{|
    +id: string
  |},
  +contract: ?{|
    +id: string
  |},
  +transaction: ?{|
    +hash: string
  |},
|};
export type SearchQuery = {|
  variables: SearchQueryVariables,
  response: SearchQueryResponse,
|};
*/


/*
query SearchQuery(
  $value: String!
  $index: Int
) {
  address(hash: $value) {
    id
  }
  asset(hash: $value) {
    id
  }
  block(hash: $value, index: $index) {
    id
  }
  contract(hash: $value) {
    id
  }
  transaction(hash: $value) {
    hash
    id
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "value",
    "type": "String!",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "index",
    "type": "Int",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "hash",
    "variableName": "value",
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
  v2
],
v4 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "address",
  "storageKey": null,
  "args": v1,
  "concreteType": "Address",
  "plural": false,
  "selections": v3
},
v5 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "asset",
  "storageKey": null,
  "args": v1,
  "concreteType": "Asset",
  "plural": false,
  "selections": v3
},
v6 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "block",
  "storageKey": null,
  "args": [
    {
      "kind": "Variable",
      "name": "hash",
      "variableName": "value",
      "type": "String"
    },
    {
      "kind": "Variable",
      "name": "index",
      "variableName": "index",
      "type": "Int"
    }
  ],
  "concreteType": "Block",
  "plural": false,
  "selections": v3
},
v7 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "contract",
  "storageKey": null,
  "args": v1,
  "concreteType": "Contract",
  "plural": false,
  "selections": v3
},
v8 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "hash",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "SearchQuery",
  "id": "21",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "SearchQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      v4,
      v5,
      v6,
      v7,
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transaction",
        "storageKey": null,
        "args": v1,
        "concreteType": "Transaction",
        "plural": false,
        "selections": [
          v8
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "SearchQuery",
    "argumentDefinitions": v0,
    "selections": [
      v4,
      v5,
      v6,
      v7,
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transaction",
        "storageKey": null,
        "args": v1,
        "concreteType": "Transaction",
        "plural": false,
        "selections": [
          v8,
          v2
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '200bb22a5672885a2a75490b1c024ad2';
module.exports = node;
