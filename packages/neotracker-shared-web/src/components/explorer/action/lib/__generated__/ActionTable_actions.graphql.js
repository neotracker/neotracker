/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type LogItem_action$ref = any;
type NotificationItem_action$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type ActionTable_actions$ref: FragmentReference;
export type ActionTable_actions = $ReadOnlyArray<{|
  +id: string,
  +type: string,
  +$fragmentRefs: LogItem_action$ref & NotificationItem_action$ref,
  +$refType: ActionTable_actions$ref,
|}>;
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "ActionTable_actions",
  "type": "Action",
  "metadata": {
    "plural": true
  },
  "argumentDefinitions": [],
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "id",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "type",
      "args": null,
      "storageKey": null
    },
    {
      "kind": "FragmentSpread",
      "name": "LogItem_action",
      "args": null
    },
    {
      "kind": "FragmentSpread",
      "name": "NotificationItem_action",
      "args": null
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = 'f88bc262adf4e46288ff0c96172a5c2b';
module.exports = node;
