import { Type } from '../lib';

export class CurrentPrice extends Type {
  public static readonly typeName = 'CurrentPrice';
  public static readonly definition = {
    id: 'ID!',
    sym: 'String!',
    price_usd: 'Float!',
    percent_change_24h: 'Float!',
    volume_usd_24h: 'Float!',
    market_cap_usd: 'Float!',
    last_updated: 'Int!',
  };
}
