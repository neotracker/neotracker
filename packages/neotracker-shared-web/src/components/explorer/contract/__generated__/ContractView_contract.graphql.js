/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type ContractViewExtra_contract$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type ContractView_contract$ref: FragmentReference;
export type ContractView_contract = {|
  +hash: string,
  +name: string,
  +version: string,
  +parameters_raw: string,
  +return_type: string,
  +needs_storage: boolean,
  +author: string,
  +email: string,
  +description: string,
  +$fragmentRefs: ContractViewExtra_contract$ref,
  +$refType: ContractView_contract$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "ContractView_contract",
  "type": "Contract",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "hash",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "name",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "version",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "parameters_raw",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "return_type",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "needs_storage",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "author",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "email",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "description",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "FragmentSpread",
      "name": "ContractViewExtra_contract",
      "args": null
    }
  ]
};
(node/*: any*/).hash = '65b0e89b2d1d8888237de1b2cc3e6bd6';
module.exports = node;
