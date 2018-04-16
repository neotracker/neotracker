/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from 'relay-runtime';
declare export opaque type BlockTransactionPagingView_block$ref: FragmentReference;
export type BlockTransactionPagingView_block = {|
  +hash: string,
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
      "name": "hash",
      "args": null,
      "storageKey": null
    }
  ]
};
(node/*: any*/).hash = '654ade44e553b6fd96b65f73649fe0a0';
module.exports = node;
