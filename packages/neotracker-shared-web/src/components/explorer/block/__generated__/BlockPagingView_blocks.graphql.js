/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type BlockTable_blocks$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type BlockPagingView_blocks$ref: FragmentReference;
export type BlockPagingView_blocks = $ReadOnlyArray<{|
  +$fragmentRefs: BlockTable_blocks$ref,
  +$refType: BlockPagingView_blocks$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "BlockPagingView_blocks",
  "type": "Block",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "BlockTable_blocks",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '6f1fdd679d5091689aa26209e3830778';
module.exports = node;
