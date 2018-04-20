/* @flow */
import convertIDs from './convertIDs';
import fixEFX from './fixEFX';
import fixQLC from './fixQLC';
import fixTHOR from './fixTHOR';
import fixSkippedTransfers from './fixSkippedTransfers';
import resyncActions from './resyncActions';
import resyncTransferCoins from './resyncTransferCoins';
import updateIndices from './updateIndices';
import processedNextIndexNotify from './processedNextIndexNotify';

export type MigrationName =
  | 'convertIDs'
  | 'resyncActions-3'
  | 'fixQLC-0'
  | 'fixSkippedTransfers-2'
  | 'resyncTransferCoins-2'
  | 'updateIndices-0'
  | 'fixTHOR-0'
  | 'fixEFX-0'
  | 'processedNextIndexNotify';

export default [
  ['convertIDs', convertIDs],
  ['resyncActions-3', resyncActions],
  ['fixQLC-0', fixQLC],
  // NOTE: Fixing skipped transfers requires resyncing transfer coins.
  ['fixSkippedTransfers-2', fixSkippedTransfers],
  ['resyncTransferCoins-2', resyncTransferCoins],
  ['updateIndices-0', updateIndices],
  ['fixTHOR-0', fixTHOR],
  ['fixEFX-0', fixEFX],
  ['processedNextIndexNotify', processedNextIndexNotify],
];
