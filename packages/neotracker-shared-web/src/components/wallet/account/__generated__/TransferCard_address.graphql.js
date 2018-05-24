/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransferView_address$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransferCard_address$ref: FragmentReference;
export type TransferCard_address = {|
  +$fragmentRefs: TransferView_address$ref,
  +$refType: TransferCard_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransferCard_address",
  "type": "Address",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransferView_address",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '0bd437c0a4e8562ca65da75348f724ed';
module.exports = node;
