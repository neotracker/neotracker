/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type BlockViewExtra_block$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type BlockView_block$ref: FragmentReference;
export type BlockView_block = {|
  +hash: string,
  +index: number,
  +confirmations: number,
  +size: number,
  +version: number,
  +time: number,
  +previous_block_hash: ?string,
  +next_block_hash: ?string,
  +merkle_root: string,
  +transaction_count: number,
  +validator_address_hash: ?string,
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
      "name": "previous_block_hash",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "hash",
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
      "name": "next_block_hash",
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
      "name": "validator_address_hash",
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
(node/*: any*/).hash = '32568e7a2bf252c2bbc589c86df8a79e';
module.exports = node;
