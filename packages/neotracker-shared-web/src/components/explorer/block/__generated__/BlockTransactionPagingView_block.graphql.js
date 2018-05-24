/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type BlockTransactionPagingView_block$ref: FragmentReference;
export type BlockTransactionPagingView_block = {|
  +id: string,
  +$refType: BlockTransactionPagingView_block$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "BlockTransactionPagingView_block",
  "type": "Block",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "id",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'ed887ca91cf4a69f6ceac3fea21c1903';
module.exports = node;
