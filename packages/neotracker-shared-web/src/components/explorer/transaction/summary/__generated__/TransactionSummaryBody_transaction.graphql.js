/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type TransactionClaimSummaryBody_transaction$ref = any;
type TransactionEnrollmentSummaryBody_transaction$ref = any;
type TransactionInputOutputSummaryBody_transaction$ref = any;
type TransactionInvocationSummaryBody_transaction$ref = any;
type TransactionPublishSummaryBody_transaction$ref = any;
type TransactionRegisterSummaryBody_transaction$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type TransactionSummaryBody_transaction$ref: FragmentReference;
export type TransactionSummaryBody_transaction = {|
  +type: string,
  +$fragmentRefs: TransactionClaimSummaryBody_transaction$ref & TransactionEnrollmentSummaryBody_transaction$ref & TransactionInputOutputSummaryBody_transaction$ref & TransactionPublishSummaryBody_transaction$ref & TransactionRegisterSummaryBody_transaction$ref & TransactionInvocationSummaryBody_transaction$ref,
  +$refType: TransactionSummaryBody_transaction$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "TransactionSummaryBody_transaction",
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
      "kind": "FragmentSpread",
      "name": "TransactionClaimSummaryBody_transaction",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionEnrollmentSummaryBody_transaction",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionInputOutputSummaryBody_transaction",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionPublishSummaryBody_transaction",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionRegisterSummaryBody_transaction",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "TransactionInvocationSummaryBody_transaction",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '0b33975e599bd1f4d39801a32eb742a6';
module.exports = node;
