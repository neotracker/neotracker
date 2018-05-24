/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type SendTransaction_address$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransferView_address$ref: FragmentReference;
export type TransferView_address = {|
  +$fragmentRefs: SendTransaction_address$ref,
  +$refType: TransferView_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransferView_address",
  "type": "Address",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "SendTransaction_address",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '8d02dabec2d7824bb6e6cecf8a69a158';
module.exports = node;
