/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
import type { FragmentReference } from 'relay-runtime';
declare export opaque type TransactionActionPagingTable_transaction$ref: FragmentReference;
export type TransactionActionPagingTable_transaction = {|
  +id: string,
  +$refType: TransactionActionPagingTable_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionActionPagingTable_transaction",
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
(node/*: any*/).hash = 'e385a2af4640f46fc8c56374d8e12b16';
module.exports = node;
