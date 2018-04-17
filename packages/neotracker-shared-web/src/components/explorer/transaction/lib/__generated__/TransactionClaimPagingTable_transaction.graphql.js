/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from 'relay-runtime';
declare export opaque type TransactionClaimPagingTable_transaction$ref: FragmentReference;
export type TransactionClaimPagingTable_transaction = {|
  +id: string,
  +$refType: TransactionClaimPagingTable_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionClaimPagingTable_transaction",
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
(node/*: any*/).hash = 'c8fc831087fed706a824afbb9f31e967';
module.exports = node;
