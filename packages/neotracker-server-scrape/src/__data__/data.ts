import { LogRaw, NotificationRaw, StringContractParameter } from '@neo-one/client';

interface BlockData {
  readonly defaultBlockHash: string;
  readonly defaultBlockIndex: number;
  readonly defaultTransactionHash: string;
  readonly defaultTransactionIndex: number;
}

const defaults: ReadonlyArray<BlockData> = [
  {
    defaultBlockHash: '0x6d5382f73b890eed53d6c9ba45584f22d8ebb2cddb7525ab83ae167ff7703941',
    defaultBlockIndex: 10,
    defaultTransactionHash: '0xc6c9cd5cacfaa18921cb0869945fbdeda2d0308f3a7458f7a1c9528c06150cf5',
    defaultTransactionIndex: 2,
  },
  {
    defaultBlockHash: '0x50959061250196698fdad3ce1ca6649b21689692ee6c1fcde4aad4d9fbd24220',
    defaultBlockIndex: 11,
    defaultTransactionHash: '0x83ec19a0492cd9146e5f9c6ef278fb66a90a8507f812b2f3901523a300b76b60',
    defaultTransactionIndex: 0,
  },
  {
    defaultBlockHash: '0x9aaa573e9f38487f63ba624a7d55a6d97cb7f0fcb272c3e993dd5a4d43f678dc',
    defaultBlockIndex: 12,
    defaultTransactionHash: '0xcb87f68c020b54eea34c1bd8f2bad54653fce4e919c3313451f34d6a7b7034fe',
    defaultTransactionIndex: 0,
  },
];

// tslint:disable no-let
let currentBlock = 0;
let defaultBlockHash = defaults[currentBlock].defaultBlockHash;
let defaultBlockIndex = defaults[currentBlock].defaultBlockIndex;
let defaultTransactionHash = defaults[currentBlock].defaultTransactionHash;
let defaultTransactionIndex = defaults[currentBlock].defaultTransactionIndex;
// tslint:enable no-let

export const nextBlock = () => {
  currentBlock += 1;
  defaultBlockHash = defaults[currentBlock].defaultBlockHash;
  defaultBlockIndex = defaults[currentBlock].defaultBlockIndex;
  defaultTransactionHash = defaults[currentBlock].defaultTransactionHash;
  defaultTransactionIndex = defaults[currentBlock].defaultTransactionIndex;
};

const defaultScriptHash = '0xab38352559b8b203bde5fddfa0b07d8b2525e132';
const defaultStringValue = 'foobar';

export const createStringContractParameter = ({
  value = defaultStringValue,
}: Partial<StringContractParameter>): StringContractParameter => ({
  type: 'String',
  value,
});

export const createNotificationRaw = ({
  version = 0,
  blockIndex = defaultBlockIndex,
  blockHash = defaultBlockHash,
  transactionIndex = defaultTransactionIndex,
  transactionHash = defaultTransactionHash,
  index,
  globalIndex,
  scriptHash = defaultScriptHash,
  args = [createStringContractParameter({})],
}: Partial<NotificationRaw> & Pick<NotificationRaw, 'globalIndex' | 'index'>): NotificationRaw => ({
  type: 'Notification',
  version,
  blockIndex,
  blockHash,
  transactionIndex,
  transactionHash,
  index,
  globalIndex,
  scriptHash,
  args,
});

export const createLogRaw = ({
  version = 0,
  blockIndex = defaultBlockIndex,
  blockHash = defaultBlockHash,
  transactionIndex = defaultTransactionIndex,
  transactionHash = defaultTransactionHash,
  index,
  globalIndex,
  scriptHash = defaultScriptHash,
  message = defaultStringValue,
}: Partial<LogRaw> & Pick<LogRaw, 'globalIndex' | 'index'>): LogRaw => ({
  type: 'Log',
  version,
  blockIndex,
  blockHash,
  transactionIndex,
  transactionHash,
  index,
  globalIndex,
  scriptHash,
  message,
});
