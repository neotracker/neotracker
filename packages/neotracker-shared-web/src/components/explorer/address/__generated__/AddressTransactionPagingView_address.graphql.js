/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from 'relay-runtime';
declare export opaque type AddressTransactionPagingView_address$ref: FragmentReference;
export type AddressTransactionPagingView_address = {|
  +hash: string,
  +$refType: AddressTransactionPagingView_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AddressTransactionPagingView_address",
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
(node/*: any*/).hash = '713c43a6e8b9ea3c4c9038ad6a396194';
module.exports = node;
