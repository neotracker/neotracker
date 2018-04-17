/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionInputOutputTable_input_outputs$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type TransactionInputTable_inputs$ref: FragmentReference;
export type TransactionInputTable_inputs = $ReadOnlyArray<{|
  +output_transaction_id: string,
  +$fragmentRefs: TransactionInputOutputTable_input_outputs$ref,
  +$refType: TransactionInputTable_inputs$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionInputTable_inputs",
  "type": "TransactionInputOutput",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransactionInputOutputTable_input_outputs",
      "args": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "output_transaction_id",
      "args": null,
      "storageKey": null
    }
  ]
};
(node/*: any*/).hash = 'b5ddef58b38f5ecc46d9a3d68e5b8f97';
module.exports = node;
