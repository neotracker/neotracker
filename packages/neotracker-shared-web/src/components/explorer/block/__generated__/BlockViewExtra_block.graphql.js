/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type BlockTransactionPagingView_block$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type BlockViewExtra_block$ref: FragmentReference;
export type BlockViewExtra_block = {|
  +script: {|
    +invocation_script: string,
    +verification_script: string,
  |},
  +$fragmentRefs: BlockTransactionPagingView_block$ref,
  +$refType: BlockViewExtra_block$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "BlockViewExtra_block",
  "type": "Block",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "BlockTransactionPagingView_block",
      "args": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "script",
      "storageKey": null,
      "args": null,
      "concreteType": "Script",
      "plural": false,
      "selections": [
        {
          "kind": "ScalarField",
          "alias": null,
          "name": "invocation_script",
          "args": null,
          "storageKey": null
        },
        {
          "kind": "ScalarField",
          "alias": null,
          "name": "verification_script",
          "args": null,
          "storageKey": null
        }
      ]
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '3f2bb3e8a16d7e3a6460d5c9c37bffdd';
module.exports = node;
