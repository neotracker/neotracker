import {
  Asset,
  AssetType,
  Attribute,
  Block,
  ConfirmedTransaction,
  Contract,
  ContractParameter,
  Input,
  Output,
  RawAction,
  RawInvocationData,
  RawInvocationResult,
} from '@neo-one/client-full';
import { utils } from '@neotracker/shared-utils';

export const normalizeHash = (hash: string): string => {
  if (hash.startsWith('0x')) {
    return hash.substring(2);
  }

  return hash;
};

const normalizeInput = (input: Input): Input => ({
  hash: normalizeHash(input.hash),
  index: input.index,
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
  address: contract.address,
  script: contract.script,
  parameters: contract.parameters,
  returnType: contract.returnType,
  name: contract.name,
  codeVersion: contract.codeVersion,
  author: contract.author,
  email: contract.email,
  description: contract.description,
  storage: contract.storage,
  dynamicInvoke: contract.dynamicInvoke,
  payable: contract.payable,
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

    case 'Address':
      return {
        type: 'Address',
        value: contractParameter.value,
      };

    case 'Hash256':
      return {
        type: 'Hash256',
        value: normalizeHash(contractParameter.value),
      };

    case 'Buffer':
      return {
        type: 'Buffer',
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

    case 'Map':
      return {
        type: 'Map',
        value: contractParameter.value,
      };

    default:
      utils.assertNever(contractParameter);
      throw new Error('For TS');
  }
};

export const normalizeAction = (action: RawAction): RawAction => {
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
        address: action.address,
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
        address: action.address,
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

const normalizeAssetType = (asset: AssetType) => {
  switch (asset) {
    case 'Credit':
      return 'CreditFlag';
    case 'Duty':
      return 'DutyFlag';
    case 'Governing':
      return 'GoverningToken';
    case 'Utility':
      return 'UtilityToken';
    case 'Currency':
      return 'Currency';
    case 'Share':
      return 'Share';
    case 'Invoice':
      return 'Invoice';
    case 'Token':
      return 'Token';
    default:
      utils.assertNever(asset);
      throw new Error('Unknown AssetType');
  }
};

const normalizeAsset = (asset: Asset): Asset => ({
  hash: normalizeHash(asset.hash),
  // tslint:disable-next-line no-any
  type: normalizeAssetType(asset.type) as any,
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
  deletedContractAddresses: data.deletedContractAddresses,
  migratedContractAddresses: data.migratedContractAddresses,
  actions: data.actions.map(normalizeAction),
  storageChanges: data.storageChanges,
});

const normalizeTransaction = (transaction: ConfirmedTransaction): ConfirmedTransaction => {
  const transactionBase = {
    hash: normalizeHash(transaction.hash),
    size: transaction.size,
    version: transaction.version,
    attributes: transaction.attributes.map(normalizeAttribute),
    inputs: transaction.inputs.map(normalizeInput),
    outputs: transaction.outputs.map(normalizeOutput),
    scripts: transaction.scripts,
    systemFee: transaction.systemFee,
    networkFee: transaction.networkFee,
    receipt: {
      ...transaction.receipt,
      blockHash: normalizeHash(transaction.receipt.blockHash),
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
        asset: {
          ...transaction.asset,
          // tslint:disable-next-line no-any
          type: normalizeAssetType(transaction.asset.type) as any,
        },
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
