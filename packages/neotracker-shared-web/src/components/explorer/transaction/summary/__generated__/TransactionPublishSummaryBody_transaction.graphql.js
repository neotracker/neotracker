/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type ContractPublished_contract$ref = any;
type TransactionInputPagingTable_transaction$ref = any;
type TransactionOutputPagingTable_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionPublishSummaryBody_transaction$ref: FragmentReference;
export type TransactionPublishSummaryBody_transaction = {|
  +contracts: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +$fragmentRefs: ContractPublished_contract$ref
      |}
    |}>
  |},
  +$fragmentRefs: TransactionInputPagingTable_transaction$ref & TransactionOutputPagingTable_transaction$ref,
  +$refType: TransactionPublishSummaryBody_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionPublishSummaryBody_transaction",
  "type": "Transaction",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "TransactionInputPagingTable_transaction",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionOutputPagingTable_transaction",
      "args": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "contracts",
      "storageKey": null,
      "args": null,
      "concreteType": "TransactionToContractsConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "TransactionToContractsEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "Contract",
              "plural": false,
              "selections": [
                {
                  "kind": "FragmentSpread",
                  "name": "ContractPublished_contract",
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
// prettier-ignore
(node/*: any*/).hash = 'b51519ca376b607f2cd6012051e1023d';
module.exports = node;
