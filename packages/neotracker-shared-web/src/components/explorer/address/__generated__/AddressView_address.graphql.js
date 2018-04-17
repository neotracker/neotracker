/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type AddressViewExtra_address$ref = any;
type CoinTable_coins$ref = any;
type Coin_coin$ref = any;
import type { FragmentReference } from 'relay-runtime';
declare export opaque type AddressView_address$ref: FragmentReference;
export type AddressView_address = {|
  +id: string,
  +transaction_id: ?string,
  +block_time: number,
  +transaction_count: number,
  +transfer_count: number,
  +coins: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +value: string,
        +asset: {|
          +id: string,
          +symbol: string,
        |},
        +$fragmentRefs: CoinTable_coins$ref,
      |},
    |}>,
  |},
  +claim_value_available_coin: {|
    +$fragmentRefs: Coin_coin$ref,
  |},
  +$fragmentRefs: AddressViewExtra_address$ref,
  +$refType: AddressView_address$ref,
|};
*/


const node/*: ConcreteFragment*/ = (function(){
var v0 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Fragment",
  "name": "AddressView_address",
  "type": "Address",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "AddressViewExtra_address",
      "args": null
    },
    v0,
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "transaction_id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "block_time",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "transaction_count",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "transfer_count",
      "args": null,
      "storageKey": null
    },
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
                },
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "value",
                  "args": null,
                  "storageKey": null
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
                    v0,
                    {
                      "kind": "ScalarField",
                      "alias": null,
                      "name": "symbol",
                      "args": null,
                      "storageKey": null
                    }
                  ]
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
          "kind": "FragmentSpread",
          "name": "Coin_coin",
          "args": null
        }
      ]
    }
  ]
};
})();
(node/*: any*/).hash = 'b75c902bc5b8a7c94d75a04382c28f8d';
module.exports = node;
