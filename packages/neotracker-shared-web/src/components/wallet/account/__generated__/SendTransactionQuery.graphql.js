/**
 * @flow
 * @relayHash db1c98687672bea60803bce832e986ab
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type SendTransactionQueryVariables = {||};
export type SendTransactionQueryResponse = {|
  +transactions: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +network_fee: string
      |}
    |}>
  |}
|};
export type SendTransactionQuery = {|
  variables: SendTransactionQueryVariables,
  response: SendTransactionQueryResponse,
|};
*/


/*
query SendTransactionQuery {
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
  "name": "SendTransactionQuery",
  "id": "60",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "SendTransactionQuery",
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
    "name": "SendTransactionQuery",
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
(node/*: any*/).hash = '59c4f0405ed8a438be454f7b6cfe9847';
module.exports = node;
