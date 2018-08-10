/**
 * @flow
 * @relayHash 19155547aa9218ac0d865b228a39ea5e
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type TransactionView_transaction$ref = any;
export type TransactionQueryVariables = {|
  hash: string
|};
export type TransactionQueryResponse = {|
  +transaction: ?{|
    +hash: string,
    +$fragmentRefs: TransactionView_transaction$ref,
  |}
|};
export type TransactionQuery = {|
  variables: TransactionQueryVariables,
  response: TransactionQueryResponse,
|};
*/


/*
query TransactionQuery(
  $hash: String!
) {
  transaction(hash: $hash) {
    hash
    ...TransactionView_transaction
    id
  }
}

fragment TransactionView_transaction on Transaction {
  ...TransactionSummaryBody_transaction
  type
  hash
  network_fee
  system_fee
  size
  block_time
  block_id
  ...TransactionViewExtra_transaction
}

fragment TransactionSummaryBody_transaction on Transaction {
  type
  ...TransactionClaimSummaryBody_transaction
  ...TransactionEnrollmentSummaryBody_transaction
  ...TransactionInputOutputSummaryBody_transaction
  ...TransactionPublishSummaryBody_transaction
  ...TransactionRegisterSummaryBody_transaction
  ...TransactionInvocationSummaryBody_transaction
}

fragment TransactionViewExtra_transaction on Transaction {
  type
  scripts {
    invocation_script
    verification_script
  }
  script
}

fragment TransactionClaimSummaryBody_transaction on Transaction {
  ...TransactionClaimPagingTable_transaction
  ...TransactionOutputPagingTable_transaction
}

fragment TransactionEnrollmentSummaryBody_transaction on Transaction {
  ...TransactionInputPagingTable_transaction
  ...TransactionOutputPagingTable_transaction
  enrollment {
    address {
      id
    }
    id
  }
}

fragment TransactionInputOutputSummaryBody_transaction on Transaction {
  ...TransactionInputPagingTable_transaction
  ...TransactionOutputPagingTable_transaction
}

fragment TransactionPublishSummaryBody_transaction on Transaction {
  ...TransactionInputPagingTable_transaction
  ...TransactionOutputPagingTable_transaction
  contracts {
    edges {
      node {
        ...ContractPublished_contract
        id
      }
    }
  }
}

fragment TransactionRegisterSummaryBody_transaction on Transaction {
  ...TransactionInputPagingTable_transaction
  ...TransactionOutputPagingTable_transaction
  asset {
    ...AssetRegistered_asset
    id
  }
}

fragment TransactionInvocationSummaryBody_transaction on Transaction {
  ...TransactionInputPagingTable_transaction
  ...TransactionOutputPagingTable_transaction
  asset {
    ...AssetRegistered_asset
    id
  }
  transfers {
    edges {
      node {
        asset {
          ...AssetNameLink_asset
          id
        }
        from_address_id
        to_address_id
        value
        id
      }
    }
  }
  contracts {
    edges {
      node {
        id
        ...ContractPublished_contract
      }
    }
  }
}

fragment TransactionInputPagingTable_transaction on Transaction {
  hash
}

fragment TransactionOutputPagingTable_transaction on Transaction {
  hash
}

fragment AssetRegistered_asset on Asset {
  ...AssetNameLink_asset
}

fragment AssetNameLink_asset on Asset {
  id
  symbol
}

fragment ContractPublished_contract on Contract {
  ...ContractNameLink_contract
}

fragment ContractNameLink_contract on Contract {
  id
  name
}

fragment TransactionClaimPagingTable_transaction on Transaction {
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
  "name": "hash",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v4 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "asset",
  "storageKey": null,
  "args": null,
  "concreteType": "Asset",
  "plural": false,
  "selections": [
    v3,
    {
      "kind": "ScalarField",
      "alias": null,
      "name": "symbol",
      "args": null,
      "storageKey": null
    }
  ]
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "TransactionQuery",
  "id": "46",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "TransactionQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transaction",
        "storageKey": null,
        "args": v1,
        "concreteType": "Transaction",
        "plural": false,
        "selections": [
          v2,
          {
            "kind": "FragmentSpread",
            "name": "TransactionView_transaction",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "TransactionQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "transaction",
        "storageKey": null,
        "args": v1,
        "concreteType": "Transaction",
        "plural": false,
        "selections": [
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "system_fee",
            "args": null,
            "storageKey": null
          },
          v2,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "enrollment",
            "storageKey": null,
            "args": null,
            "concreteType": "TransactionInputOutput",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "address",
                "storageKey": null,
                "args": null,
                "concreteType": "Address",
                "plural": false,
                "selections": [
                  v3
                ]
              },
              v3
            ]
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "contracts",
            "storageKey": null,
            "args": null,
            "concreteType": "TransactionToContractsConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "TransactionToContractsEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "Contract",
                    "plural": false,
                    "selections": [
                      v3,
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "name",
                        "args": null,
                        "storageKey": null
                      }
                    ]
                  }
                ]
              }
            ]
          },
          v4,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "transfers",
            "storageKey": null,
            "args": null,
            "concreteType": "TransactionToTransfersConnection",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "edges",
                "storageKey": null,
                "args": null,
                "concreteType": "TransactionToTransfersEdge",
                "plural": true,
                "selections": [
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "Transfer",
                    "plural": false,
                    "selections": [
                      v4,
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "from_address_id",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "to_address_id",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "value",
                        "args": null,
                        "storageKey": null
                      },
                      v3
                    ]
                  }
                ]
              }
            ]
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "network_fee",
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
            "name": "size",
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
            "name": "block_id",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "scripts",
            "storageKey": null,
            "args": null,
            "concreteType": "Script",
            "plural": true,
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
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "script",
            "args": null,
            "storageKey": null
          },
          v3
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '496b9e735d6768b6a046e818d2814d21';
module.exports = node;
