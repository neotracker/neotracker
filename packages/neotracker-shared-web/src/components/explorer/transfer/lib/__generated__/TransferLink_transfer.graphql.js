/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransferLink_transfer$ref: FragmentReference;
export type TransferLink_transfer = {|
  +transaction_id: string,
  +$refType: TransferLink_transfer$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransferLink_transfer",
  "type": "Transfer",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "transaction_id",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'd53c015947d692a1c12eb83ae29b85be';
module.exports = node;
