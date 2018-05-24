/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteFragment } from 'relay-runtime';
type ActionItem_action$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type LogItem_action$ref: FragmentReference;
export type LogItem_action = {|
  +message: ?string,
  +$fragmentRefs: ActionItem_action$ref,
  +$refType: LogItem_action$ref,
|};
*/


const node/*: ConcreteFragment*/ = {
  "kind": "Fragment",
  "name": "LogItem_action",
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
    }
  ]
};
// prettier-ignore
(node/*: any*/).hash = '4246650f4b681fa46e7d81ce80b68069';
module.exports = node;
