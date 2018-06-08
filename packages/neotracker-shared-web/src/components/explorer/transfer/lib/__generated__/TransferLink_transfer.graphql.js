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
  +transaction_hash: string,
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
      "name": "transaction_hash",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'c6c6f9d7c178facb3cbafc26eb840530';
module.exports = node;
