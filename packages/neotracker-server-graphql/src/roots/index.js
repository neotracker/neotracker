/* @flow */
import type { Observable } from 'rxjs/Observable';

import { merge } from 'rxjs/observable/merge';

import type { RootCallOptions } from '../lib';

import AddressRootCall from './AddressRootCall';
import AppOptionsRootCall from './AppOptionsRootCall';
import AssetRootCall from './AssetRootCall';
import BlockRootCall from './BlockRootCall';
import ContractRootCall from './ContractRootCall';
import CurrentPriceRootCall from './CurrentPriceRootCall';
import PricesRootCall from './PricesRootCall';
import TransactionRootCall from './TransactionRootCall';

export { default as AddressRootCall } from './AddressRootCall';
export { default as AppOptionsRootCall } from './AppOptionsRootCall';
export { default as AssetRootCall } from './AssetRootCall';
export { default as BlockRootCall } from './BlockRootCall';
export { default as ContractRootCall } from './ContractRootCall';
export { default as CurrentPriceRootCall } from './CurrentPriceRootCall';
export { default as PricesRootCall } from './PricesRootCall';
export { default as TransactionRootCall } from './TransactionRootCall';

const roots = [
  AddressRootCall,
  AppOptionsRootCall,
  AssetRootCall,
  BlockRootCall,
  ContractRootCall,
  CurrentPriceRootCall,
  PricesRootCall,
  TransactionRootCall,
];

export const start$ = (
  options$: Observable<RootCallOptions>,
): Observable<any> =>
  merge(...roots.map(rootCall => rootCall.initialize(options$)));

export default roots;
