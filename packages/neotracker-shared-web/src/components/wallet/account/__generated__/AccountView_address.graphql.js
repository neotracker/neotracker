/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AccountViewBase_address$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type AccountView_address$ref: FragmentReference;
export type AccountView_address = {|
  +$fragmentRefs: AccountViewBase_address$ref,
  +$refType: AccountView_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AccountView_address",
  "type": "Address",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "AccountViewBase_address",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'c225b160f40579bdde5032d2776c4e1b';
module.exports = node;
