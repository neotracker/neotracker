/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionTypeAndLink_transaction$ref: FragmentReference;
export type TransactionTypeAndLink_transaction = {|
  +type: string,
  +id: string,
  +$refType: TransactionTypeAndLink_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionTypeAndLink_transaction",
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
      "kind": "ScalarField",
      "alias": null,
      "name": "id",
      "args": null,
      "storageKey": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'f0b5a567d8fe0c56625bff30d0cd0d52';
module.exports = node;
