/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AddressTransactionPagingView_address$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type WalletTransactionsCard_address$ref: FragmentReference;
export type WalletTransactionsCard_address = {|
  +$fragmentRefs: AddressTransactionPagingView_address$ref,
  +$refType: WalletTransactionsCard_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "WalletTransactionsCard_address",
  "type": "Address",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "AddressTransactionPagingView_address",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '9b369c841c295b6f06dc855e0abf8603';
module.exports = node;
