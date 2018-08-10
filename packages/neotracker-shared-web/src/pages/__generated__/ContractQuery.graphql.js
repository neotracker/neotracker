/**
 * @flow
 * @relayHash 97269c8deb63adc1b21e2acf8446fd2a
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type ContractView_contract$ref = any;
export type ContractQueryVariables = {|
  hash: string
|};
export type ContractQueryResponse = {|
  +contract: ?{|
    +name: string,
    +$fragmentRefs: ContractView_contract$ref,
  |}
|};
export type ContractQuery = {|
  variables: ContractQueryVariables,
  response: ContractQueryResponse,
|};
*/


/*
query ContractQuery(
  $hash: String!
) {
  contract(hash: $hash) {
    name
    ...ContractView_contract
    id
  }
}

fragment ContractView_contract on Contract {
  id
  name
  version
  parameters_raw
  return_type
  needs_storage
  author
  email
  description
  ...ContractViewExtra_contract
}

fragment ContractViewExtra_contract on Contract {
  script
  transaction {
    ...TransactionSummary_transaction
    id
  }
}

fragment TransactionSummary_transaction on Transaction {
  hash
  ...TransactionSummaryHeader_transaction
}

fragment TransactionSummaryHeader_transaction on Transaction {
  ...TransactionHeaderBackground_transaction
  ...TransactionTypeAndLink_transaction
  type
  block_time
}

fragment TransactionHeaderBackground_transaction on Transaction {
  type
}

fragment TransactionTypeAndLink_transaction on Transaction {
  type
  hash
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "hash",
    "type": "String!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "hash",
    "variableName": "hash",
    "type": "String!"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "name",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "ContractQuery",
  "id": "5",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "ContractQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "contract",
        "storageKey": null,
        "args": v1,
        "concreteType": "Contract",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "FragmentSpread",
            "name": "ContractView_contract",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "ContractQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "contract",
        "storageKey": null,
        "args": v1,
        "concreteType": "Contract",
        "plural": false,
        "selections": [
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "needs_storage",
            "args": null,
            "storageKey": null
          },
          v2,
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
          v3,
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
            "kind": "ScalarField",
            "alias": null,
            "name": "script",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "transaction",
            "storageKey": null,
            "args": null,
            "concreteType": "Transaction",
            "plural": false,
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
                "name": "type",
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
              v3
            ]
          }
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '8c98408ee303d4da40179a46eb1378b9';
module.exports = node;
