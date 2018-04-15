/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from 'relay-runtime';
declare export opaque type AddressTransferPagingView_address$ref: FragmentReference;
export type AddressTransferPagingView_address = {|
  +hash: string,
  +$refType: AddressTransferPagingView_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AddressTransferPagingView_address",
  "type": "Address",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "hash",
      "args": null,
      "storageKey": null
    }
  ]
};
(node/*: any*/).hash = '9692b7471a36157176b13933f3a400f4';
module.exports = node;
