/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AddressTransferPagingView_address$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type WalletTransfersCard_address$ref: FragmentReference;
export type WalletTransfersCard_address = {|
  +$fragmentRefs: AddressTransferPagingView_address$ref,
  +$refType: WalletTransfersCard_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "WalletTransfersCard_address",
  "type": "Address",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "AddressTransferPagingView_address",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'c1c90f1911ddb52fc464ea0b008a56e2';
module.exports = node;
