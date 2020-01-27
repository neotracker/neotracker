import {
  addressToScriptHash,
  Block,
  ConfirmedTransaction,
  ConfirmedTransactionBase,
  Header,
  Input,
  Output,
  RawLog,
  RawNotification,
  scriptHashToAddress,
  StringContractParameter,
  TransactionBase,
} from '@neo-one/client-full';
import {
  Address as AddressModel,
  Asset as AssetModel,
  Block as BlockModel,
  Coin as CoinModel,
  Contract as ContractModel,
  NEP5_CONTRACT_TYPE,
  SUBTYPE_NONE,
  Transaction as TransactionModel,
  TransactionInputOutput as TransactionInputOutputModel,
  TYPE_INPUT,
} from '@neotracker/server-db';
import BigNumber from 'bignumber.js';

interface BlockData {
  readonly defaultBlockHash: string;
  readonly defaultBlockIndex: number;
  readonly defaultPreviousHash: string;
  readonly defaultTransactionHash: string;
  readonly defaultTransactionIndex: number;
  readonly defaultAddressID: string;
  readonly defaultAssetID: string;
  readonly defaultScriptHash: string;
}

const defaults: ReadonlyArray<BlockData> = [
  {
    defaultBlockHash: '0x6d5382f73b890eed53d6c9ba45584f22d8ebb2cddb7525ab83ae167ff7703941',
    defaultPreviousHash: '0x6d5382f73b890eed53d6c9ba45584f22d8ebb2cdd0f96kDFwofgiaspdfasfd23',
    defaultAssetID: 'g95k2ovja9toglc9e42c8eb9tghid43ew3ry804eaf1a0b4kfob049OOOOOOOOO',
    defaultAddressID: 'APyEx5f4Zm4oCHwFWiSTaph1fAAAAAAAAA',
    defaultScriptHash: '0xab38352559b8b203bde5fddfa0b07d8b25111111',
    defaultBlockIndex: 1,
    defaultTransactionHash: '0xc6c9cd5cacfaa18921cb0869945fbdeda2d0308f3a7458f7a1c9528c06150cf5',
    defaultTransactionIndex: 2,
  },
  {
    defaultBlockHash: '0x50959061250196698fdad3ce1ca6649b21689692ee6c1fcde4aad4d9fbd24220',
    defaultPreviousHash: '0x6d5382f73b890eed53d6c9ba45584f22d8ebb2cddb7525ab83ae167ff7703941',
    defaultAssetID: 'g95k2ovja9toglc9e42c8eb9tghid43ew3ry804eaf1a0b4kfob049VVVVVVVVV',
    defaultAddressID: 'APyEx5f4Zm4oCHwFWiSTaph1fBBBBBBBBB',
    defaultScriptHash: '0xab38352559b8b203bde5fddfa0b07d8b25333333',
    defaultBlockIndex: 2,
    defaultTransactionHash: '0x83ec19a0492cd9146e5f9c6ef278fb66a90a8507f812b2f3901523a300b76b60',
    defaultTransactionIndex: 1,
  },
  {
    defaultBlockHash: '0x9aaa573e9f38487f63ba624a7d55a6d97cb7f0fcb272c3e993dd5a4d43f678dc',
    defaultPreviousHash: '0x50959061250196698fdad3ce1ca6649b21689692ee6c1fcde4aad4d9fbd24220',
    defaultAssetID: 'g95k2ovja9toglc9e42c8eb9tghid43ew3ry804eaf1a0b4kfob049XXXXXXXXX',
    defaultAddressID: 'APyEx5f4Zm4oCHwFWiSTaph1fCCCCCCCCC',
    defaultScriptHash: '0xab38352559b8b203bde5fddfa0b07d8b25555555',
    defaultBlockIndex: 3,
    defaultTransactionHash: '0xcb87f68c020b54eea34c1bd8f2bad54653fce4e919c3313451f34d6a7b7034fe',
    defaultTransactionIndex: 0,
  },
];

// tslint:disable no-let
let currentBlock = 0;
let defaultBlockHash = defaults[currentBlock].defaultBlockHash;
let defaultPreviousHash = defaults[currentBlock].defaultPreviousHash;
let defaultBlockIndex = defaults[currentBlock].defaultBlockIndex;
let defaultTransactionHash = defaults[currentBlock].defaultTransactionHash;
let defaultTransactionIndex = defaults[currentBlock].defaultTransactionIndex;
let defaultAddressID = defaults[currentBlock].defaultAddressID;
let defaultAssetID = defaults[currentBlock].defaultAssetID;
let defaultScriptHash = scriptHashToAddress(defaults[currentBlock].defaultScriptHash);
// tslint:enable no-let

export const nextBlock = () => {
  currentBlock += 1;
  defaultBlockHash = defaults[currentBlock].defaultBlockHash;
  defaultPreviousHash = defaults[currentBlock].defaultPreviousHash;
  defaultBlockIndex = defaults[currentBlock].defaultBlockIndex;
  defaultTransactionHash = defaults[currentBlock].defaultTransactionHash;
  defaultTransactionIndex = defaults[currentBlock].defaultTransactionIndex;
  defaultAddressID = defaults[currentBlock].defaultAddressID;
  defaultAssetID = defaults[currentBlock].defaultAssetID;
  defaultScriptHash = scriptHashToAddress(defaults[currentBlock].defaultScriptHash);
};

const defaultStringValue = 'foobar';
const defaultStaticHash = '7f48028c38117ac9e42c8e1f6f06ae027cdbb904eaf1a0bdc30c9d81694e045c';

export const createStringContractParameter = ({
  value = defaultStringValue,
}: Partial<StringContractParameter>): StringContractParameter => ({
  type: 'String',
  value,
});

export const createRawNotification = ({
  version = 0,
  blockIndex = defaultBlockIndex,
  blockHash = defaultBlockHash,
  transactionIndex = defaultTransactionIndex,
  transactionHash = defaultTransactionHash,
  index,
  globalIndex,
  address = defaultScriptHash,
  args = [createStringContractParameter({})],
}: Partial<RawNotification> & Pick<RawNotification, 'globalIndex' | 'index'>): RawNotification => ({
  type: 'Notification',
  version,
  blockIndex,
  blockHash,
  transactionIndex,
  transactionHash,
  index,
  globalIndex,
  address,
  args,
});

export const createRawLog = ({
  version = 0,
  blockIndex = defaultBlockIndex,
  blockHash = defaultBlockHash,
  transactionIndex = defaultTransactionIndex,
  transactionHash = defaultTransactionHash,
  index,
  globalIndex,
  address = defaultScriptHash,
  message = defaultStringValue,
}: Partial<RawLog> & Pick<RawLog, 'globalIndex' | 'index'>): RawLog => ({
  type: 'Log',
  version,
  blockIndex,
  blockHash,
  transactionIndex,
  transactionHash,
  index,
  globalIndex,
  address,
  message,
});

export const createTransactionInputOutput = ({
  id = 'test',
  type = TYPE_INPUT,
  subtype = SUBTYPE_NONE,
  output_transaction_id = '0',
  output_transaction_hash = defaultStaticHash,
  output_transaction_index = defaultBlockIndex,
  output_block_id = defaultBlockIndex,
  asset_id = defaultAssetID,
  value = '1',
  address_id = defaultAddressID,
  claim_value,
}: Partial<TransactionInputOutputModel>): Partial<TransactionInputOutputModel> => ({
  id,
  type,
  subtype,
  output_transaction_id,
  output_transaction_hash,
  output_transaction_index,
  output_block_id,
  asset_id,
  value,
  address_id,
  claim_value,
});

export const createContract = ({
  id,
  script = 'test',
  parameters_raw = 'param_test',
  return_type = 'test',
  needs_storage = false,
  name = 'test',
  version = '0.1',
  author = 'Jack Mehoff',
  email = 'jackmehoff@sunpic.net',
  description = 'eats butts',
  transaction_id = defaultTransactionIndex.toString(),
  transaction_hash = defaultStaticHash,
  block_time = 15,
  block_id = defaultBlockIndex,
  type = NEP5_CONTRACT_TYPE,
}: Partial<ContractModel> & Pick<ContractModel, 'id'>): Partial<ContractModel> => ({
  id,
  script,
  parameters_raw,
  return_type,
  needs_storage,
  name,
  version,
  author,
  email,
  description,
  transaction_id,
  transaction_hash,
  block_time,
  block_id,
  type,
});

export const createAsset = ({
  id,
  transaction_id = defaultTransactionIndex.toString(),
  transaction_hash = defaultStaticHash,
  type = 'Token',
  name_raw = 'IM RAW AF',
  symbol = 'OwO',
  amount = '500',
  precision = 4,
  block_time = 15,
  issued = '60',
  address_count = '1',
  transaction_count = '5',
  transfer_count = '20',
  aggregate_block_id = defaultBlockIndex,
}: Partial<AssetModel> & Pick<AssetModel, 'id'>): Partial<AssetModel> => ({
  id,
  transaction_id,
  transaction_hash,
  type,
  name_raw,
  symbol,
  amount,
  precision,
  block_time,
  issued,
  address_count,
  transaction_count,
  transfer_count,
  aggregate_block_id,
});
// tslint:disable no-null-keyword
export const createAddress = ({
  id = 'test',
  transaction_id = defaultTransactionIndex.toString(),
  transaction_hash = defaultTransactionHash.slice(2),
  block_id = defaultBlockIndex,
  block_time = 15,
  transaction_count = '10',
  transfer_count = '20',
  aggregate_block_id = defaultBlockIndex - 1,
  last_transaction_hash = null,
  last_transaction_time = null,
  last_transaction_id = null,
}: Partial<AddressModel> & Pick<AddressModel, 'id'>): Partial<AddressModel> => ({
  id,
  transaction_id,
  transaction_hash,
  block_id,
  block_time,
  transaction_count,
  transfer_count,
  aggregate_block_id,
  last_transaction_hash,
  last_transaction_time,
  last_transaction_id,
});
// tslint:enable no-null-keyword

export const createCoin = ({
  id = 'test',
  address_id = defaultAddressID,
  asset_id = defaultAssetID,
  value = '1',
  block_id = defaultBlockIndex,
}: Partial<CoinModel> & Pick<CoinModel, 'id'>): Partial<CoinModel> => ({
  id,
  address_id,
  asset_id,
  value,
  block_id,
});

export const createTransaction = ({
  id,
  hash = defaultStaticHash,
  type = 'ContractTransaction',
  size = 10,
  version = 0,
  attributes_raw = '0x1234',
  system_fee = '0.00000000',
  network_fee = '0.00000000',
  block_id = defaultBlockIndex,
  block_time = 15,
  index = defaultBlockIndex,
  scripts_raw = addressToScriptHash(defaultScriptHash),
}: Partial<TransactionModel> & Pick<TransactionModel, 'id'>): Partial<TransactionModel> => ({
  id,
  hash,
  type,
  size,
  version,
  attributes_raw,
  system_fee,
  network_fee,
  block_id,
  block_time,
  index,
  scripts_raw,
});

export const createBlockModel = ({
  id = defaultBlockIndex,
  size = 20,
  hash = defaultBlockHash.slice(2),
  version = 0,
  merkle_root = '7f48028c38117ac9e42c8e1f6f06ae027cdbb904eaf1a0bdc30c9d81694e045c',
  time = 15,
  nonce = 'testtesttesttest',
  next_validator_address_id = 'APyEx5f4Zm4oCHwFWWVVVVVVVVVxVGTyVR',
  invocation_script = '0xecc6b20d3ccac1ee9ef109af5a7cdb85706b1df9',
  verification_script = '0xecc6dot9h0vac1ee9ef109af5a7cdb85706b1g6y',
  transaction_count = 1,
  previous_block_id = defaultBlockIndex - 1,
  previous_block_hash = defaultPreviousHash.slice(2),
  system_fee = '0',
  network_fee = '0',
  aggregated_system_fee = '0',
}: Partial<BlockModel>): Partial<BlockModel> => ({
  id,
  size,
  hash,
  version,
  merkle_root,
  time,
  nonce,
  next_validator_address_id,
  invocation_script,
  verification_script,
  transaction_count,
  previous_block_id,
  previous_block_hash,
  system_fee,
  network_fee,
  aggregated_system_fee,
});

// neo-one types
const createBlockHeader = ({
  version = 0,
  hash = defaultBlockHash.slice(2),
  previousBlockHash = defaultPreviousHash.slice(2),
  merkleRoot = '7f48028c38117ac9e42c8e1f6f06ae027cdbb904eaf1a0bdc30c9d81694e045c',
  time = 15,
  index = defaultBlockIndex,
  nonce = 'testtestesttest',
  nextConsensus = 'APyEx5f4Zm4oCHwFWWVVVVVVVVVxVGTyVR',
  script = {
    invocation: '0xecc6b20d3ccac1ee9ef109af5a7cdb85706b1df9',
    verification: '0xecc6dot9h0vac1ee9ef109af5a7cdb85706b1g6y',
  },
  size = 20,
}: Partial<Header>): Header => ({
  version,
  hash,
  previousBlockHash,
  merkleRoot,
  time,
  index,
  nonce,
  nextConsensus,
  script,
  size,
});

const createTransactionBase = ({
  version = 0,
  hash = defaultStaticHash,
  size = 10,
  attributes = [],
  inputs = [],
  outputs = [],
  scripts = [],
  systemFee = new BigNumber(0),
  networkFee = new BigNumber(0),
}: Partial<TransactionBase>): TransactionBase => ({
  version,
  hash,
  size,
  attributes,
  inputs,
  outputs,
  scripts,
  systemFee,
  networkFee,
});

const createConfirmedTransactionBase = ({
  blockHash = defaultBlockHash,
  blockIndex = defaultBlockIndex,
  index = 0,
  globalIndex = new BigNumber('1'),
}: {
  readonly blockHash?: string;
  readonly blockIndex?: number;
  readonly index?: number;
  readonly globalIndex?: BigNumber;
}): ConfirmedTransactionBase => ({
  receipt: {
    blockHash,
    blockIndex,
    transactionIndex: index,
    globalIndex,
  },
});

export const createInput = ({ hash = defaultStaticHash, index = 1 }: Partial<Input>): Input => ({
  hash,
  index,
});

export const createOutput = ({
  asset = defaultAssetID,
  value = new BigNumber(1),
  address = defaultAddressID,
}: Partial<Output>): Output => ({
  asset,
  value,
  address,
});

export const createUnspentOutput = (inputData: Partial<Input> = {}, outputData: Partial<Output> = {}) => ({
  ...createInput(inputData),
  ...createOutput(outputData),
});

export const createConfirmedTransaction = ({
  type = 'ContractTransaction',
  transactionBase = {},
  blockHash,
  blockIndex,
  index,
  globalIndex,
  typeOptions = {},
}: {
  readonly type?: string;
  readonly transactionBase: Partial<TransactionBase>;
  readonly blockHash?: string;
  readonly blockIndex?: number;
  readonly index?: number;
  readonly globalIndex?: BigNumber;
  // tslint:disable-next-line no-any
  readonly typeOptions?: any;
}) => ({
  ...createTransactionBase(transactionBase),
  ...createConfirmedTransactionBase({
    blockHash,
    blockIndex,
    index,
    globalIndex,
  }),
  ...typeOptions,
  type,
});

export const createBlock = (
  headerOptions: Partial<Header> = {},
  transactions: ReadonlyArray<ConfirmedTransaction> = [],
): Block => ({
  ...createBlockHeader(headerOptions),
  transactions,
});
