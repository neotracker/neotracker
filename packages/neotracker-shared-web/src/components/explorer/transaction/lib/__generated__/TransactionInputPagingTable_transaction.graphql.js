/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from 'relay-runtime';
declare export opaque type TransactionInputPagingTable_transaction$ref: FragmentReference;
export type TransactionInputPagingTable_transaction = {|
  +id: string,
  +$refType: TransactionInputPagingTable_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionInputPagingTable_transaction",
  "type": "Transaction",
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
(node/*: any*/).hash = 'bd88a4441d35c94d98be232a3d4d097e';
module.exports = node;
