/* @flow */
import { Type } from '../lib';

export default class CurrentPrice extends Type {
  static typeName = 'CurrentPrice';
  static definition = {
    id: 'ID!',
    sym: 'String!',
    price_usd: 'Float!',
    percent_change_24h: 'Float!',
    volume_usd_24h: 'Float!',
    market_cap_usd: 'Float!',
    last_updated: 'Int!',
  };
}
