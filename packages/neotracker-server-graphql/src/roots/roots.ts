import { AddressRootCall } from './AddressRootCall';
import { AppOptionsRootCall } from './AppOptionsRootCall';
import { AssetRootCall } from './AssetRootCall';
import { BlockRootCall } from './BlockRootCall';
import { ContractRootCall } from './ContractRootCall';
import { CurrentPriceRootCall } from './CurrentPriceRootCall';
import { MoonPayRootCall } from './MoonPayRootCall';
import { PricesRootCall } from './PricesRootCall';
import { TransactionRootCall } from './TransactionRootCall';

export const roots = () => [
  AddressRootCall,
  AppOptionsRootCall,
  AssetRootCall,
  BlockRootCall,
  ContractRootCall,
  CurrentPriceRootCall,
  MoonPayRootCall,
  PricesRootCall,
  TransactionRootCall,
];
