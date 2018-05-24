/**
 * @flow
 * @relayHash df6802cd192b8eb3b98c572eda5939dd
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type createAppContextAppOptionsQueryVariables = {||};
export type createAppContextAppOptionsQueryResponse = {|
  +app_options: string
|};
*/


/*
query createAppContextAppOptionsQuery {
  app_options
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "app_options",
    "args": null,
    "storageKey": null
  }
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "createAppContextAppOptionsQuery",
  "id": "3",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "createAppContextAppOptionsQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": v0
  },
  "operation": {
    "kind": "Operation",
    "name": "createAppContextAppOptionsQuery",
    "argumentDefinitions": [],
    "selections": v0
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '10638f9e4a2854d638f863796cffc7be';
module.exports = node;
