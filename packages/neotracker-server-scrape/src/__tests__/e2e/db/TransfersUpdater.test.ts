import BigNumber from 'bignumber.js';
import { TransfersRevert, TransfersSave, TransfersUpdater } from '../../../db/TransfersUpdater';
import { CoinChange, TransferData } from '../../../types';
import { data } from '../../data';
import { updaterUnitTest, UpdaterUtilTestOptions } from '../../data/updaterTestUtil';

const coinChangesInit: ReadonlyArray<CoinChange> = [
  {
    address: 'APyEx5f4Zm4oCHwFWiSTaph1fPBxZacYVR',
    asset: 'g95k2ovja9toglc9e42c8eb9tghid43ew3ry804eaf1a0b4kfob049askbof4y8',
    value: new BigNumber('1'),
  },
];

const transferDataInit: TransferData = {
  result: {
    fromAddressID: 'APyEx5f4Zm4oCHwFWiSTaph1fPBxZacYVR',
    toAddressID: 'RIPEx5f4Zm4oCHwFWiSTaph1fPBxZacGVX',
    assetID: 'g95k2ovja9toglc9e42c8eb9tghid43ew3ry804eaf1a0b4kfob049askbof4y8',
    transferID: '1'.repeat(8),
    coinChanges: coinChangesInit,
  },
  value: new BigNumber('3'),
};

const coinChangesSecondary: ReadonlyArray<CoinChange> = [
  {
    address: 'APyEx5f4Zm4oCHwFWiSTaph1fPBxZacYVR',
    asset: 'g95k2ovja9toglc9e42c8eb9tghid43ew3ry804eaf1a0b4kfob049askbof4y8',
    value: new BigNumber('2'),
  },
];

const transferDataSecondary: TransferData = {
  result: {
    fromAddressID: 'APyEx5f4Zm4oCHwFWiSTaph1fPBxZacYVR',
    toAddressID: 'RIPEx5f4Zm4oCHwFWiSTaph1fPBxZacGVX',
    assetID: 'g95k2ovja9toglc9e42c8eb9tghid43ew3ry804eaf1a0b4kfob049askbof4y8',
    transferID: '2'.repeat(8),
    coinChanges: coinChangesSecondary,
  },
  value: new BigNumber('4'),
};

const getInputs = (): TransfersSave => ({
  transactions: [
    {
      action: data.createRawLog({
        index: 0,
        globalIndex: new BigNumber(0),
      }),
      transferData: transferDataInit,
      transactionID: '1'.repeat(16),
      transactionHash: 'c6c9cd5cacfaa18921cb0869945fbdeda2d0308f3a7458f7a1c9528c06150cf5',
      transactionIndex: 15,
    },
  ],
  blockIndex: 10,
  blockTime: 15,
});

const getSecondaryInputs = (): TransfersSave => ({
  transactions: [
    {
      action: data.createRawLog({
        index: 0,
        globalIndex: new BigNumber(0),
      }),
      transferData: transferDataSecondary,
      transactionID: '1'.repeat(16),
      transactionHash: 'c6c9cd5cacfaa18921cb0869945fbdeda2d0308f3a7458f7a1c9528c06150cf5',
      transactionIndex: 15,
    },
  ],
  blockIndex: 10,
  blockTime: 15,
});

const getReversions = (): TransfersRevert => ({
  transferIDs: ['2'.repeat(8)],
});

const utilOptions: UpdaterUtilTestOptions<TransfersSave, TransfersRevert, undefined> = {
  name: `Transfers Updater`,
  createUpdater: () => new TransfersUpdater(),
  getInputs,
  getSecondaryInputs,
  getReversions,
};

updaterUnitTest(utilOptions);
