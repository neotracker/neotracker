/**
 * @flow
 * @relayHash ab5e6b482724c211d663b774fd736507
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type SearchQueryVariables = {|
  value: string,
  index?: ?string,
|};
export type SearchQueryResponse = {|
  +address: ?{|
    +id: string,
  |},
  +asset: ?{|
    +id: string,
  |},
  +block: ?{|
    +index: number,
  |},
  +contract: ?{|
    +id: string,
  |},
  +transaction: ?{|
    +id: string,
  |},
|};
*/


/*
query SearchQuery(
  $value: String!
  $index: String
) {
  address(hash: $value) {
    id
  }
  asset(hash: $value) {
    id
  }
  block(hash: $value, index: $index) {
    index
    id
  }
  contract(hash: $value) {
    id
  }
  transaction(hash: $value) {
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
    "type": "String",
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
v6 = [
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
    "type": "String"
  }
],
v7 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "index",
  "args": null,
  "storageKey": null
},
v8 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "contract",
  "storageKey": null,
  "args": v1,
  "concreteType": "Contract",
  "plural": false,
  "selections": v3
},
v9 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "transaction",
  "storageKey": null,
  "args": v1,
  "concreteType": "Transaction",
  "plural": false,
  "selections": v3
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "SearchQuery",
  "id": "25",
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
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "block",
        "storageKey": null,
        "args": v6,
        "concreteType": "Block",
        "plural": false,
        "selections": [
          v7
        ]
      },
      v8,
      v9
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "SearchQuery",
    "argumentDefinitions": v0,
    "selections": [
      v4,
      v5,
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "block",
        "storageKey": null,
        "args": v6,
        "concreteType": "Block",
        "plural": false,
        "selections": [
          v7,
          v2
        ]
      },
      v8,
      v9
    ]
  }
};
})();
(node/*: any*/).hash = '67a60cb2cab0ab7643af5a2e195e9dcb';
module.exports = node;
