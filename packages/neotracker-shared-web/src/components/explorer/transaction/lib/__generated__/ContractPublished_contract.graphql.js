/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type ContractNameLink_contract$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type ContractPublished_contract$ref: FragmentReference;
export type ContractPublished_contract = {|
  +$fragmentRefs: ContractNameLink_contract$ref,
  +$refType: ContractPublished_contract$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "ContractPublished_contract",
  "type": "Contract",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "ContractNameLink_contract",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'df08967a4a1bcacf28431844879c816c';
module.exports = node;
