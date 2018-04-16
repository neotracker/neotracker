/* @flow */
import fixQLC from './fixQLC';
import fixSkippedTransfers from './fixSkippedTransfers';
import resyncActions from './resyncActions';
import resyncTransferCoins from './resyncTransferCoins';
import updateIndices from './updateIndices';
import processedNextIndexNotify from './processedNextIndexNotify';

export type MigrationName =
  | 'resyncActions'
  | 'fixQLC-0'
  | 'fixSkippedTransfers-2'
  | 'resyncTransferCoins-1'
  | 'updateIndices'
  | 'processedNextIndexNotify';

export default [
  ['resyncActions', resyncActions],
  ['fixQLC-0', fixQLC],
  ['fixSkippedTransfers-2', fixSkippedTransfers],
  ['resyncTransferCoins-1', resyncTransferCoins],
  ['updateIndices', updateIndices],
  ['processedNextIndexNotify', processedNextIndexNotify],
];
