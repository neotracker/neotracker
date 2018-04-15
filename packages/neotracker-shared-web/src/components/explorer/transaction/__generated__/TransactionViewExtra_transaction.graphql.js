/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransferTable_transfers$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type TransactionViewExtra_transaction$ref: FragmentReference;
export type TransactionViewExtra_transaction = {|
  +type: string,
  +scripts: $ReadOnlyArray<{|
    +invocation_script: string,
    +verification_script: string,
  |}>,
  +transfers: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +$fragmentRefs: TransferTable_transfers$ref,
      |},
    |}>,
  |},
  +$refType: TransactionViewExtra_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionViewExtra_transaction",
  "type": "Transaction",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "type",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "scripts",
      "storageKey": null,
      "args": null,
      "concreteType": "Script",
      "plural": true,
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
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "transfers",
      "storageKey": null,
      "args": null,
      "concreteType": "TransactionToTransfersConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "TransactionToTransfersEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "Transfer",
              "plural": false,
              "selections": [
                {
                  "kind": "FragmentSpread",
                  "name": "TransferTable_transfers",
                  "args": null
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
(node/*: any*/).hash = 'e37bcd0303711c3d77652b72ac1abe55';
module.exports = node;
