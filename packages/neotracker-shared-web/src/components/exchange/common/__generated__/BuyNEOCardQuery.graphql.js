/**
 * @flow
 * @relayHash e2f77999a5a6d53a737cf52d7afecaf8
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type BuyNEOCardQueryVariables = {|
  url: string
|};
export type BuyNEOCardQueryResponse = {|
  +moonpay: ?{|
    +secureUrl: string
  |}
|};
export type BuyNEOCardQuery = {|
  variables: BuyNEOCardQueryVariables,
  response: BuyNEOCardQueryResponse,
|};
*/


/*
query BuyNEOCardQuery(
  $url: String!
) {
  moonpay(url: $url) {
    secureUrl
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "url",
    "type": "String!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "moonpay",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "url",
        "variableName": "url",
        "type": "String!"
      }
    ],
    "concreteType": "MoonPay",
    "plural": false,
    "selections": [
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "secureUrl",
        "args": null,
        "storageKey": null
      }
    ]
  }
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "BuyNEOCardQuery",
  "id": "68",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "BuyNEOCardQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": v1
  },
  "operation": {
    "kind": "Operation",
    "name": "BuyNEOCardQuery",
    "argumentDefinitions": v0,
    "selections": v1
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '75e7486531ca2b84bcda42e495f24089';
module.exports = node;
