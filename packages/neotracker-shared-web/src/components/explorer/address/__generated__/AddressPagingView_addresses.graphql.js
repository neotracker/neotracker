/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AddressTable_addresses$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type AddressPagingView_addresses$ref: FragmentReference;
export type AddressPagingView_addresses = $ReadOnlyArray<{|
  +$fragmentRefs: AddressTable_addresses$ref,
  +$refType: AddressPagingView_addresses$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AddressPagingView_addresses",
  "type": "Address",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "AddressTable_addresses",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '85443bcedd4e9fe8aa5f69f59e98a3ee';
module.exports = node;
