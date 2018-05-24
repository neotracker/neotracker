/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AccountView_address$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type SelectCard_address$ref: FragmentReference;
export type SelectCard_address = {|
  +$fragmentRefs: AccountView_address$ref,
  +$refType: SelectCard_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "SelectCard_address",
  "type": "Address",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "AccountView_address",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '468632a3387cc28b19cbb7d75ec69522';
module.exports = node;
