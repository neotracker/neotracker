/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type ActionItem_action$ref = any;
type TransferItem_transfer$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type NotificationItem_action$ref: FragmentReference;
export type NotificationItem_action = {|
  +message: ?string,
  +args_raw: ?string,
  +transfer: ?{|
    +$fragmentRefs: TransferItem_transfer$ref
  |},
  +$fragmentRefs: ActionItem_action$ref,
  +$refType: NotificationItem_action$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "NotificationItem_action",
  "type": "Action",
  "metadata": null,
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "FragmentSpread",
      "name": "ActionItem_action",
      "args": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "message",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "args_raw",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "LinkedField",
      "alias": null,
      "name": "transfer",
      "storageKey": null,
      "args": null,
      "concreteType": "Transfer",
      "plural": false,
      "selections": [
        {
          "kind": "FragmentSpread",
          "name": "TransferItem_transfer",
          "args": null
        }
      ]
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '99e80303936812b18717dd00765a3654';
module.exports = node;
