import {
  ActionRaw,
  Asset,
  Attribute,
  Block,
  ConfirmedTransaction,
  Contract,
  ContractParameter,
  Input,
  Output,
  RawInvocationData,
  RawInvocationResult,
} from '@neo-one/client';
import { utils } from '@neotracker/shared-utils';

export const normalizeHash = (hash: string): string => {
  if (hash.startsWith('0x')) {
    return hash.substring(2);
  }

  return hash;
};

const normalizeInput = (input: Input): Input => ({
  txid: normalizeHash(input.txid),
  vout: input.vout,
});

const normalizeOutput = (output: Output): Output => ({
  asset: normalizeHash(output.asset),
  value: output.value,
  address: output.address,
});

const normalizeAttribute = (attribute: Attribute): Attribute => ({
  // tslint:disable-next-line no-any
  usage: attribute.usage as any,
  data: normalizeHash(attribute.data),
});

const normalizeContract = (contract: Contract): Contract => ({
  version: contract.version,
  hash: normalizeHash(contract.hash),
  script: contract.script,
  parameters: contract.parameters,
  returnType: contract.returnType,
  name: contract.name,
  codeVersion: contract.codeVersion,
  author: contract.author,
  email: contract.email,
  description: contract.description,
  properties: contract.properties,
});

const normalizeContractParameter = (contractParameter: ContractParameter): ContractParameter => {
  switch (contractParameter.type) {
    case 'Signature':
      return {
        type: 'Signature',
        value: contractParameter.value,
      };

    case 'Boolean':
      return {
        type: 'Boolean',
        value: contractParameter.value,
      };

    case 'Integer':
      return {
        type: 'Integer',
        value: contractParameter.value,
      };

    case 'Hash160':
      return {
        type: 'Hash160',
        value: normalizeHash(contractParameter.value),
      };

    case 'Hash256':
      return {
        type: 'Hash256',
        value: normalizeHash(contractParameter.value),
      };

    case 'ByteArray':
      return {
        type: 'ByteArray',
        value: contractParameter.value,
      };

    case 'PublicKey':
      return {
        type: 'PublicKey',
        value: contractParameter.value,
      };

    case 'String':
      return {
        type: 'String',
        value: contractParameter.value,
      };

    case 'Array':
      return {
        type: 'Array',
        value: contractParameter.value,
      };

    case 'InteropInterface':
      return {
        type: 'InteropInterface',
      };

    case 'Void':
      return {
        type: 'Void',
      };

    default:
      utils.assertNever(contractParameter);
      throw new Error('For TS');
  }
};

export const normalizeAction = (action: ActionRaw): ActionRaw => {
  switch (action.type) {
    case 'Log':
      return {
        type: 'Log',
        version: action.version,
        blockIndex: action.blockIndex,
        blockHash: normalizeHash(action.blockHash),
        transactionIndex: action.transactionIndex,
        transactionHash: normalizeHash(action.transactionHash),
        index: action.index,
        globalIndex: action.globalIndex,
        scriptHash: normalizeHash(action.scriptHash),
        message: action.message,
      };

    case 'Notification':
      return {
        type: 'Notification',
        version: action.version,
        blockIndex: action.blockIndex,
        blockHash: normalizeHash(action.blockHash),
        transactionIndex: action.transactionIndex,
        transactionHash: normalizeHash(action.transactionHash),
        index: action.index,
        globalIndex: action.globalIndex,
        scriptHash: normalizeHash(action.scriptHash),
        args: action.args.map(normalizeContractParameter),
      };

    default:
      utils.assertNever(action);
      throw new Error('Unknown action type');
  }
};

const normalizeInvocationResult = (result: RawInvocationResult): RawInvocationResult => {
  switch (result.state) {
    case 'HALT':
      return {
        state: 'HALT',
        gasCost: result.gasCost,
        gasConsumed: result.gasConsumed,
        stack: result.stack.map(normalizeContractParameter),
      };
    case 'FAULT':
      return {
        state: 'FAULT',
        gasCost: result.gasCost,
        gasConsumed: result.gasConsumed,
        stack: result.stack.map(normalizeContractParameter),
        message: result.message,
      };
    default:
      utils.assertNever(result);
      throw new Error('Unknown InvocationResult type');
  }
};

const normalizeAsset = (asset: Asset): Asset => ({
  hash: normalizeHash(asset.hash),
  type: asset.type,
  name: asset.name,
  amount: asset.amount,
  available: asset.available,
  precision: asset.precision,
  owner: asset.owner,
  admin: asset.admin,
  issuer: asset.issuer,
  expiration: asset.expiration,
  frozen: asset.frozen,
});

const normalizeInvocationData = (data: RawInvocationData): RawInvocationData => ({
  result: normalizeInvocationResult(data.result),
  asset: data.asset === undefined ? data.asset : normalizeAsset(data.asset),
  contracts: data.contracts.map(normalizeContract),
  deletedContractHashes: data.deletedContractHashes.map(normalizeHash),
  migratedContractHashes: data.migratedContractHashes.map<[string, string]>(([hash0, hash1]) => [
    normalizeHash(hash0),
    normalizeHash(hash1),
  ]),
  voteUpdates: data.voteUpdates,
  actions: data.actions.map(normalizeAction),
});

const normalizeTransaction = (transaction: ConfirmedTransaction): ConfirmedTransaction => {
  const transactionBase = {
    txid: normalizeHash(transaction.txid),
    size: transaction.size,
    version: transaction.version,
    attributes: transaction.attributes.map(normalizeAttribute),

    vin: transaction.vin.map(normalizeInput),
    vout: transaction.vout.map(normalizeOutput),
    scripts: transaction.scripts,
    systemFee: transaction.systemFee,
    networkFee: transaction.networkFee,
    data: {
      ...transaction.data,
      blockHash: normalizeHash(transaction.data.blockHash),
    },
  };

  switch (transaction.type) {
    case 'MinerTransaction':
      return {
        ...transactionBase,
        type: 'MinerTransaction',
        nonce: transaction.nonce,
      };

    case 'IssueTransaction':
      return {
        ...transactionBase,
        type: 'IssueTransaction',
      };

    case 'ClaimTransaction':
      return {
        ...transactionBase,
        type: 'ClaimTransaction',
        claims: transaction.claims.map(normalizeInput),
      };

    case 'EnrollmentTransaction':
      return {
        ...transactionBase,
        type: 'EnrollmentTransaction',
        publicKey: transaction.publicKey,
      };

    case 'RegisterTransaction':
      return {
        ...transactionBase,
        type: 'RegisterTransaction',
        asset: transaction.asset,
      };

    case 'ContractTransaction':
      return {
        ...transactionBase,
        type: 'ContractTransaction',
      };

    case 'PublishTransaction':
      return {
        ...transactionBase,
        type: 'PublishTransaction',
        contract: normalizeContract(transaction.contract),
      };

    case 'InvocationTransaction':
      return {
        ...transactionBase,
        type: 'InvocationTransaction',
        script: transaction.script,
        gas: transaction.gas,
        invocationData: normalizeInvocationData(transaction.invocationData),
      };

    case 'StateTransaction':
      return {
        ...transactionBase,
        type: 'StateTransaction',
        descriptors: transaction.descriptors,
      };

    default:
      utils.assertNever(transaction);
      throw new Error('Unknown transaction type');
  }
};

export const normalizeBlock = (block: Block): Block => ({
  hash: normalizeHash(block.hash),
  size: block.size,
  version: block.version,
  previousBlockHash: normalizeHash(block.previousBlockHash),
  merkleRoot: normalizeHash(block.merkleRoot),
  time: block.time,
  index: block.index,
  nonce: block.nonce,
  nextConsensus: block.nextConsensus,
  script: block.script,
  transactions: block.transactions.map(normalizeTransaction),
});
