import { merge, Observable } from 'rxjs';
import { RootCall, RootCallOptions } from '../lib';
import { AddressRootCall } from './AddressRootCall';
import { AppOptionsRootCall } from './AppOptionsRootCall';
import { AssetRootCall } from './AssetRootCall';
import { BlockRootCall } from './BlockRootCall';
import { ContractRootCall } from './ContractRootCall';
import { CurrentPriceRootCall } from './CurrentPriceRootCall';
import { PricesRootCall } from './PricesRootCall';
import { TransactionRootCall } from './TransactionRootCall';

export { AddressRootCall } from './AddressRootCall';
export { AppOptionsRootCall } from './AppOptionsRootCall';
export { AssetRootCall } from './AssetRootCall';
export { BlockRootCall } from './BlockRootCall';
export { ContractRootCall } from './ContractRootCall';
export { CurrentPriceRootCall } from './CurrentPriceRootCall';
export { PricesRootCall } from './PricesRootCall';
export { TransactionRootCall } from './TransactionRootCall';

// tslint:disable-next-line export-name
export const roots: ReadonlyArray<typeof RootCall> = [
  AddressRootCall,
  AppOptionsRootCall,
  AssetRootCall,
  BlockRootCall,
  ContractRootCall,
  CurrentPriceRootCall,
  PricesRootCall,
  TransactionRootCall,
];

// tslint:disable-next-line no-any
export const start$ = (options$: Observable<RootCallOptions>): Observable<any> =>
  merge(...roots.map((rootCall) => rootCall.initialize$(options$)));
