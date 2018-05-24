/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type BlockViewExtra_block$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type BlockView_block$ref: FragmentReference;
export type BlockView_block = {|
  +id: string,
  +index: number,
  +confirmations: number,
  +size: number,
  +version: number,
  +time: number,
  +previous_block_id: ?string,
  +next_block_id: ?string,
  +merkle_root: string,
  +transaction_count: number,
  +validator_address_id: ?string,
  +$fragmentRefs: BlockViewExtra_block$ref,
  +$refType: BlockView_block$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "BlockView_block",
  "type": "Block",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "previous_block_id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "confirmations",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "size",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "version",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "time",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "index",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "next_block_id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "merkle_root",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "transaction_count",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "validator_address_id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "FragmentSpread",
      "name": "BlockViewExtra_block",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'a0031152056cc4ae87e88544bc3059f3';
module.exports = node;
