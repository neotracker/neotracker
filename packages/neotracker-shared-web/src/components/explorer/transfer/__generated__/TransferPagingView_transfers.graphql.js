/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransferTable_transfers$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransferPagingView_transfers$ref: FragmentReference;
export type TransferPagingView_transfers = $ReadOnlyArray<{|
  +$fragmentRefs: TransferTable_transfers$ref,
  +$refType: TransferPagingView_transfers$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransferPagingView_transfers",
  "type": "Transfer",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransferTable_transfers",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '1625b7afad7dee8b0b0978c55b40b618';
module.exports = node;
