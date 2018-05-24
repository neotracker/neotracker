/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AssetRegistered_asset$ref = any;
type ContractPublished_contract$ref = any;
type TransactionInputPagingTable_transaction$ref = any;
type TransactionOutputPagingTable_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionInvocationSummaryBody_transaction$ref: FragmentReference;
export type TransactionInvocationSummaryBody_transaction = {|
  +asset: ?{|
    +$fragmentRefs: AssetRegistered_asset$ref
  |},
  +contracts: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +id: string,
        +$fragmentRefs: ContractPublished_contract$ref,
      |}
    |}>
  |},
  +$fragmentRefs: TransactionInputPagingTable_transaction$ref & TransactionOutputPagingTable_transaction$ref,
  +$refType: TransactionInvocationSummaryBody_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionInvocationSummaryBody_transaction",
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
      "name": "asset",
      "storageKey": null,
      "args": null,
      "concreteType": "Asset",
      "plural": false,
      "selections": [
        {
          "kind": "FragmentSpread",
          "name": "AssetRegistered_asset",
          "args": null
        }
      ]
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
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "id",
                  "args": null,
                  "storageKey": null
                },
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
(node/*: any*/).hash = 'c0224394aa31264826f7a3a68c806abb';
module.exports = node;
