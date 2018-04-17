/**
 * @flow
 * @relayHash 4a7842f542867dd79ac4588605937fce
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type apiGASIssuedAvailableQueryVariables = {| |};
export type apiGASIssuedAvailableQueryResponse = {|
  +asset: ?{|
    +issued: string,
    +available: string,
  |},
|};
*/


/*
query apiGASIssuedAvailableQuery {
  asset(hash: "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7") {
    issued
    available
    id
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "hash",
    "value": "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7",
    "type": "String!"
  }
],
v1 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "issued",
  "args": null,
  "storageKey": null
},
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "available",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "apiGASIssuedAvailableQuery",
  "id": "5",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "apiGASIssuedAvailableQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "asset",
        "storageKey": "asset(hash:\"602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7\")",
        "args": v0,
        "concreteType": "Asset",
        "plural": false,
        "selections": [
          v1,
          v2
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "apiGASIssuedAvailableQuery",
    "argumentDefinitions": [],
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "asset",
        "storageKey": "asset(hash:\"602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7\")",
        "args": v0,
        "concreteType": "Asset",
        "plural": false,
        "selections": [
          v1,
          v2,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "id",
            "args": null,
            "storageKey": null
          }
        ]
      }
    ]
  }
};
})();
(node/*: any*/).hash = '4247c5ef9371b3c9f9866d4d4c44ca0d';
module.exports = node;
