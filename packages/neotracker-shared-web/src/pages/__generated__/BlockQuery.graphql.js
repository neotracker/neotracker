/**
 * @flow
 * @relayHash 4a6c072375abdab501fdad6f60b5acda
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type BlockView_block$ref = any;
export type BlockQueryVariables = {|
  hash?: ?string,
  index?: ?string,
|};
export type BlockQueryResponse = {|
  +block: ?{|
    +index: number,
    +$fragmentRefs: BlockView_block$ref,
  |}
|};
*/


/*
query BlockQuery(
  $hash: String
  $index: String
) {
  block(hash: $hash, index: $index) {
    index
    ...BlockView_block
    id
  }
}

fragment BlockView_block on Block {
  id
  index
  confirmations
  size
  version
  time
  previous_block_id
  next_block_id
  merkle_root
  transaction_count
  validator_address_id
  ...BlockViewExtra_block
}

fragment BlockViewExtra_block on Block {
  ...BlockTransactionPagingView_block
  script {
    invocation_script
    verification_script
  }
}

fragment BlockTransactionPagingView_block on Block {
  id
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "hash",
    "type": "String",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "index",
    "type": "String",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "hash",
    "variableName": "hash",
    "type": "String"
  },
  {
    "kind": "Variable",
    "name": "index",
    "variableName": "index",
    "type": "String"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "index",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "BlockQuery",
  "id": "12",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "BlockQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "block",
        "storageKey": null,
        "args": v1,
        "concreteType": "Block",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "FragmentSpread",
            "name": "BlockView_block",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "BlockQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "block",
        "storageKey": null,
        "args": v1,
        "concreteType": "Block",
        "plural": false,
        "selections": [
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "previous_block_id",
            "args": null,
            "storageKey": null
          },
          v2,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "confirmations",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "size",
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
            "name": "time",
            "args": null,
            "storageKey": null
          },
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
            "name": "next_block_id",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "merkle_root",
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
            "name": "validator_address_id",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "script",
            "storageKey": null,
            "args": null,
            "concreteType": "Script",
            "plural": false,
            "selections": [
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "invocation_script",
                "args": null,
                "storageKey": null
              },
              {
                "kind": "ScalarField",
                "alias": null,
                "name": "verification_script",
                "args": null,
                "storageKey": null
              }
            ]
          }
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'ff3b88b5d2d0126cb803952c2c0c2418';
module.exports = node;
