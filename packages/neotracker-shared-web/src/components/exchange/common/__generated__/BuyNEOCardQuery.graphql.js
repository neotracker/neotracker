/**
 * @flow
 * @relayHash 36b7914face9ba2c1511bd01753ca2de
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type BuyNEOCardQueryVariables = {|
  url?: ?string
|};
export type BuyNEOCardQueryResponse = {|
  +moonpay: ?{|
    +secureUrl: string,
    +validUrl: boolean,
  |}
|};
export type BuyNEOCardQuery = {|
  variables: BuyNEOCardQueryVariables,
  response: BuyNEOCardQueryResponse,
|};
*/


/*
query BuyNEOCardQuery(
  $url: String
) {
  moonpay(url: $url) {
    secureUrl
    validUrl
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "url",
    "type": "String",
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
        "type": "String"
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
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "validUrl",
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
  "id": "77",
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
(node/*: any*/).hash = '7c24336d003779032ec9f20f62d02a79';
module.exports = node;
