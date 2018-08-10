/**
 * @flow
 * @relayHash 3c5652f7a8e19f2a4ea71f30cc00a83e
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type BlockView_block$ref = any;
export type BlockQueryVariables = {|
  hash?: ?string,
  index?: ?number,
|};
export type BlockQueryResponse = {|
  +block: ?{|
    +id: string,
    +$fragmentRefs: BlockView_block$ref,
  |}
|};
export type BlockQuery = {|
  variables: BlockQueryVariables,
  response: BlockQueryResponse,
|};
*/


/*
query BlockQuery(
  $hash: String
  $index: Int
) {
  block(hash: $hash, index: $index) {
    id
    ...BlockView_block
  }
}

fragment BlockView_block on Block {
  id
  hash
  size
  version
  time
  previous_block_hash
  next_block_hash
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
    "type": "Int",
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
    "type": "Int"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "BlockQuery",
  "id": "8",
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
            "name": "previous_block_hash",
            "args": null,
            "storageKey": null
          },
          v2,
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
            "name": "hash",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "next_block_hash",
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
(node/*: any*/).hash = '5ee7a69c4768655426b47561cad77bba';
module.exports = node;
