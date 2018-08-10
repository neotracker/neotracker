/**
 * @flow
 * @relayHash 8183a8da3d06b2401500a2fa97bde4fe
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type BlockTable_blocks$ref = any;
type MarketCard_neo_btc_data_points$ref = any;
type MarketCard_neo_current_price$ref = any;
type MarketCard_neo_usd_data_points$ref = any;
type TransactionTable_transactions$ref = any;
export type HomeQueryVariables = {||};
export type HomeQueryResponse = {|
  +blocks: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +$fragmentRefs: BlockTable_blocks$ref
      |}
    |}>
  |},
  +transactions: {|
    +edges: $ReadOnlyArray<{|
      +node: {|
        +$fragmentRefs: TransactionTable_transactions$ref
      |}
    |}>
  |},
  +neo_btc_data_points: $ReadOnlyArray<{|
    +$fragmentRefs: MarketCard_neo_btc_data_points$ref
  |}>,
  +neo_usd_data_points: $ReadOnlyArray<{|
    +$fragmentRefs: MarketCard_neo_usd_data_points$ref
  |}>,
  +neo_current_price: ?{|
    +$fragmentRefs: MarketCard_neo_current_price$ref
  |},
|};
export type HomeQuery = {|
  variables: HomeQueryVariables,
  response: HomeQueryResponse,
|};
*/


/*
query HomeQuery {
  blocks(orderBy: [{name: "block.id", direction: "desc"}], first: 16) {
    edges {
      node {
        ...BlockTable_blocks
        id
      }
    }
  }
  transactions(orderBy: [{name: "transaction.id", direction: "desc"}], filters: [{name: "transaction.type", operator: "!=", value: "MinerTransaction"}], first: 20) {
    edges {
      node {
        ...TransactionTable_transactions
        id
      }
    }
  }
  neo_btc_data_points: prices(from: "NEO", to: "BTC") {
    ...MarketCard_neo_btc_data_points
    id
  }
  neo_usd_data_points: prices(from: "NEO", to: "USD") {
    ...MarketCard_neo_usd_data_points
    id
  }
  neo_current_price: current_price(sym: "NEO") {
    ...MarketCard_neo_current_price
    id
  }
}

fragment BlockTable_blocks on Block {
  id
  time
  transaction_count
  validator_address_id
  size
}

fragment TransactionTable_transactions on Transaction {
  id
  ...TransactionSummary_transaction
}

fragment MarketCard_neo_btc_data_points on DataPoint {
  ...TokenMarket_pair_data_points
}

fragment MarketCard_neo_usd_data_points on DataPoint {
  ...TokenMarket_usd_data_points
}

fragment MarketCard_neo_current_price on CurrentPrice {
  ...TokenMarket_current_price
}

fragment TokenMarket_current_price on CurrentPrice {
  ...DayPrice_current_price
}

fragment DayPrice_current_price on CurrentPrice {
  price_usd
  percent_change_24h
  volume_usd_24h
  market_cap_usd
  last_updated
}

fragment TokenMarket_usd_data_points on DataPoint {
  ...BTCPriceChart_usd_data_points
  ...CNYPriceChart_usd_data_points
}

fragment BTCPriceChart_usd_data_points on DataPoint {
  ...PriceChart_usd_data_points
}

fragment CNYPriceChart_usd_data_points on DataPoint {
  ...PriceChart_usd_data_points
}

fragment PriceChart_usd_data_points on DataPoint {
  time
  value
}

fragment TokenMarket_pair_data_points on DataPoint {
  ...BTCPriceChart_btc_data_points
  ...CNYPriceChart_cny_data_points
}

fragment BTCPriceChart_btc_data_points on DataPoint {
  ...PriceChart_pair_data_points
}

fragment CNYPriceChart_cny_data_points on DataPoint {
  ...PriceChart_pair_data_points
}

fragment PriceChart_pair_data_points on DataPoint {
  time
  value
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
    "kind": "Literal",
    "name": "first",
    "value": 16,
    "type": "Int"
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "desc",
        "name": "block.id"
      }
    ],
    "type": "[OrderByInput!]"
  }
],
v1 = [
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
    "value": 20,
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
v2 = {
  "kind": "Literal",
  "name": "from",
  "value": "NEO",
  "type": "String!"
},
v3 = [
  v2,
  {
    "kind": "Literal",
    "name": "to",
    "value": "BTC",
    "type": "String!"
  }
],
v4 = [
  v2,
  {
    "kind": "Literal",
    "name": "to",
    "value": "USD",
    "type": "String!"
  }
],
v5 = [
  {
    "kind": "Literal",
    "name": "sym",
    "value": "NEO",
    "type": "String!"
  }
],
v6 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v7 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "time",
  "args": null,
  "storageKey": null
},
v8 = [
  v7,
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "value",
    "args": null,
    "storageKey": null
  },
  v6
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "HomeQuery",
  "id": "14",
  "text": null,
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "HomeQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "blocks",
        "storageKey": "blocks(first:16,orderBy:[{\"direction\":\"desc\",\"name\":\"block.id\"}])",
        "args": v0,
        "concreteType": "BlocksConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "BlocksEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Block",
                "plural": false,
                "selections": [
                  {
                    "kind": "FragmentSpread",
                    "name": "BlockTable_blocks",
                    "args": null
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
        "name": "transactions",
        "storageKey": "transactions(filters:[{\"name\":\"transaction.type\",\"operator\":\"!=\",\"value\":\"MinerTransaction\"}],first:20,orderBy:[{\"direction\":\"desc\",\"name\":\"transaction.id\"}])",
        "args": v1,
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
                  {
                    "kind": "FragmentSpread",
                    "name": "TransactionTable_transactions",
                    "args": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "kind": "LinkedField",
        "alias": "neo_btc_data_points",
        "name": "prices",
        "storageKey": "prices(from:\"NEO\",to:\"BTC\")",
        "args": v3,
        "concreteType": "DataPoint",
        "plural": true,
        "selections": [
          {
            "kind": "FragmentSpread",
            "name": "MarketCard_neo_btc_data_points",
            "args": null
          }
        ]
      },
      {
        "kind": "LinkedField",
        "alias": "neo_usd_data_points",
        "name": "prices",
        "storageKey": "prices(from:\"NEO\",to:\"USD\")",
        "args": v4,
        "concreteType": "DataPoint",
        "plural": true,
        "selections": [
          {
            "kind": "FragmentSpread",
            "name": "MarketCard_neo_usd_data_points",
            "args": null
          }
        ]
      },
      {
        "kind": "LinkedField",
        "alias": "neo_current_price",
        "name": "current_price",
        "storageKey": "current_price(sym:\"NEO\")",
        "args": v5,
        "concreteType": "CurrentPrice",
        "plural": false,
        "selections": [
          {
            "kind": "FragmentSpread",
            "name": "MarketCard_neo_current_price",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "HomeQuery",
    "argumentDefinitions": [],
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "blocks",
        "storageKey": "blocks(first:16,orderBy:[{\"direction\":\"desc\",\"name\":\"block.id\"}])",
        "args": v0,
        "concreteType": "BlocksConnection",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "edges",
            "storageKey": null,
            "args": null,
            "concreteType": "BlocksEdge",
            "plural": true,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "Block",
                "plural": false,
                "selections": [
                  v6,
                  v7,
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
                    "kind": "ScalarField",
                    "alias": null,
                    "name": "size",
                    "args": null,
                    "storageKey": null
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
        "name": "transactions",
        "storageKey": "transactions(filters:[{\"name\":\"transaction.type\",\"operator\":\"!=\",\"value\":\"MinerTransaction\"}],first:20,orderBy:[{\"direction\":\"desc\",\"name\":\"transaction.id\"}])",
        "args": v1,
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
                  v6,
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
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "kind": "LinkedField",
        "alias": "neo_btc_data_points",
        "name": "prices",
        "storageKey": "prices(from:\"NEO\",to:\"BTC\")",
        "args": v3,
        "concreteType": "DataPoint",
        "plural": true,
        "selections": v8
      },
      {
        "kind": "LinkedField",
        "alias": "neo_usd_data_points",
        "name": "prices",
        "storageKey": "prices(from:\"NEO\",to:\"USD\")",
        "args": v4,
        "concreteType": "DataPoint",
        "plural": true,
        "selections": v8
      },
      {
        "kind": "LinkedField",
        "alias": "neo_current_price",
        "name": "current_price",
        "storageKey": "current_price(sym:\"NEO\")",
        "args": v5,
        "concreteType": "CurrentPrice",
        "plural": false,
        "selections": [
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "price_usd",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "percent_change_24h",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "volume_usd_24h",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "market_cap_usd",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "last_updated",
            "args": null,
            "storageKey": null
          },
          v6
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'c21c6e732bfd9e3192eae7fc06275db3';
module.exports = node;
