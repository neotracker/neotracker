/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type CoinTable_coins$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type AccountViewBase_address$ref: FragmentReference;
export type AccountViewBase_address = {|
  +coins: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +$fragmentRefs: CoinTable_coins$ref
      |}
    |}>
  |},
  +claim_value_available_coin: {|
    +value: string
  |},
  +$refType: AccountViewBase_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "AccountViewBase_address",
  "type": "Address",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "coins",
      "storageKey": null,
      "args": null,
      "concreteType": "AddressToCoinsConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "AddressToCoinsEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "Coin",
              "plural": false,
              "selections": [
                {
                  "kind": "FragmentSpread",
                  "name": "CoinTable_coins",
                  "args": null
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "claim_value_available_coin",
      "storageKey": null,
      "args": null,
      "concreteType": "Coin",
      "plural": false,
      "selections": [
        {
          "kind": "ScalarField",
          "alias": null,
          "name": "value",
          "args": null,
          "storageKey": null
        }
      ]
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '38dd63f96713136654e5e3774333acd6';
module.exports = node;
