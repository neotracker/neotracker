/**
 * @flow
 * @relayHash 6f653f9542c9026597f4789f25ed3429
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
    +hash: string,
  |},
  +asset: ?{|
    +hash: string,
  |},
  +block: ?{|
    +index: number,
  |},
  +contract: ?{|
    +hash: string,
  |},
  +transaction: ?{|
    +hash: string,
  |},
|};
*/


/*
query SearchQuery(
  $value: String!
  $index: String
) {
  address(hash: $value) {
    hash
    id
  }
  asset(hash: $value) {
    hash
    id
  }
  block(hash: $value, index: $index) {
    index
    id
  }
  contract(hash: $value) {
    hash
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
  "name": "hash",
  "args": null,
  "storageKey": null
},
v3 = [
  v2
],
v4 = [
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
v5 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "index",
  "args": null,
  "storageKey": null
},
v6 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v7 = [
  v2,
  v6
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "SearchQuery",
  "id": "28",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "SearchQuery",
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
        "selections": v3
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "asset",
        "storageKey": null,
        "args": v1,
        "concreteType": "Asset",
        "plural": false,
        "selections": v3
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "block",
        "storageKey": null,
        "args": v4,
        "concreteType": "Block",
        "plural": false,
        "selections": [
          v5
        ]
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "contract",
        "storageKey": null,
        "args": v1,
        "concreteType": "Contract",
        "plural": false,
        "selections": v3
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transaction",
        "storageKey": null,
        "args": v1,
        "concreteType": "Transaction",
        "plural": false,
        "selections": v3
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "SearchQuery",
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
        "selections": v7
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "asset",
        "storageKey": null,
        "args": v1,
        "concreteType": "Asset",
        "plural": false,
        "selections": v7
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "block",
        "storageKey": null,
        "args": v4,
        "concreteType": "Block",
        "plural": false,
        "selections": [
          v5,
          v6
        ]
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "contract",
        "storageKey": null,
        "args": v1,
        "concreteType": "Contract",
        "plural": false,
        "selections": v7
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transaction",
        "storageKey": null,
        "args": v1,
        "concreteType": "Transaction",
        "plural": false,
        "selections": v7
      }
    ]
  }
};
})();
(node/*: any*/).hash = '6d6ec34d77b3a7b9c58f1a1eb05cfa15';
module.exports = node;
