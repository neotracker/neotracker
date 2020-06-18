/**
 * @flow
 * @relayHash d883cbf7ed56d65042e68759d89e6f0c
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type SendTransactionFeeQueryVariables = {||};
export type SendTransactionFeeQueryResponse = {|
  +transactions: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +network_fee: string
      |}
    |}>
  |}
|};
export type SendTransactionFeeQuery = {|
  variables: SendTransactionFeeQueryVariables,
  response: SendTransactionFeeQueryResponse,
|};
*/


/*
query SendTransactionFeeQuery {
  transactions(orderBy: [{name: "transaction.id", direction: "desc"}], filters: [{name: "transaction.type", operator: "!=", value: "MinerTransaction"}], first: 30) {
    edges {
      node {
        network_fee
        id
      }
    }
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "filters",
    "value": [
      {
        "name": "transaction.type",
        "operator": "!=",
        "value": "MinerTransaction"
      }
    ],
    "type": "[FilterInput!]"
  },
  {
    "kind": "Literal",
    "name": "first",
    "value": 30,
    "type": "Int"
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "desc",
        "name": "transaction.id"
      }
    ],
    "type": "[OrderByInput!]"
  }
],
v1 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "network_fee",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "SendTransactionFeeQuery",
  "id": "73",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "SendTransactionFeeQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transactions",
        "storageKey": "transactions(filters:[{\"name\":\"transaction.type\",\"operator\":\"!=\",\"value\":\"MinerTransaction\"}],first:30,orderBy:[{\"direction\":\"desc\",\"name\":\"transaction.id\"}])",
        "args": v0,
        "concreteType": "TransactionsConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "TransactionsEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Transaction",
                "plural": false,
                "selections": [
                  v1
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "SendTransactionFeeQuery",
    "argumentDefinitions": [],
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transactions",
        "storageKey": "transactions(filters:[{\"name\":\"transaction.type\",\"operator\":\"!=\",\"value\":\"MinerTransaction\"}],first:30,orderBy:[{\"direction\":\"desc\",\"name\":\"transaction.id\"}])",
        "args": v0,
        "concreteType": "TransactionsConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "TransactionsEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Transaction",
                "plural": false,
                "selections": [
                  v1,
                  {
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "id",
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
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'd10ab8de91dcf9d40781bf1acda015f5';
module.exports = node;
