/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type ContractTable_contracts$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type ContractPagingView_contracts$ref: FragmentReference;
export type ContractPagingView_contracts = $ReadOnlyArray<{|
  +$fragmentRefs: ContractTable_contracts$ref,
  +$refType: ContractPagingView_contracts$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "ContractPagingView_contracts",
  "type": "Contract",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "ContractTable_contracts",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '2e2e5672ab90a007f96ce7d7c540eeb1';
module.exports = node;
