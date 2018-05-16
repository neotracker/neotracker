/* @flow */
import type {
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
  usage: (attribute.usage: $FlowFixMe),
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

const normalizeContractParameter = (
  contractParameter: ContractParameter,
): ContractParameter => {
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
      // eslint-disable-next-line
      (contractParameter.type: empty);
      throw new Error(
        `Unknown ContractParameterType ${contractParameter.type}`,
      );
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
        scriptHash: normalizeHash(action.scriptHash),
        args: action.args.map(arg => normalizeContractParameter(arg)),
      };
    default:
      // eslint-disable-next-line
      (action.type: empty);
      throw new Error('Unknown action type');
  }
};

const normalizeInvocationResult = (
  result: RawInvocationResult,
): RawInvocationResult => {
  switch (result.state) {
    case 'HALT':
      return {
        state: 'HALT',
        gasCost: result.gasCost,
        gasConsumed: result.gasConsumed,
        stack: result.stack.map(contractParameter =>
          normalizeContractParameter(contractParameter),
        ),
      };
    case 'FAULT':
      return {
        state: 'FAULT',
        gasCost: result.gasCost,
        gasConsumed: result.gasConsumed,
        stack: result.stack.map(contractParameter =>
          normalizeContractParameter(contractParameter),
        ),
        message: result.message,
      };
    default:
      // eslint-disable-next-line
      (result.state: empty);
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

const normalizeInvocationData = (
  data: RawInvocationData,
): RawInvocationData => ({
  result: normalizeInvocationResult(data.result),
  asset: data.asset == null ? data.asset : normalizeAsset(data.asset),
  contracts: data.contracts.map(contract => normalizeContract(contract)),
  deletedContractHashes: data.deletedContractHashes.map(hash =>
    normalizeHash(hash),
  ),
  migratedContractHashes: data.migratedContractHashes.map(([hash0, hash1]) => [
    normalizeHash(hash0),
    normalizeHash(hash1),
  ]),
  voteUpdates: data.voteUpdates,
  actions: data.actions,
});

const normalizeTransaction = (
  transaction: ConfirmedTransaction,
): ConfirmedTransaction => {
  switch (transaction.type) {
    case 'MinerTransaction':
      return {
        type: 'MinerTransaction',
        txid: normalizeHash(transaction.txid),
        size: transaction.size,
        version: transaction.version,
        attributes: transaction.attributes.map(attribute =>
          normalizeAttribute(attribute),
        ),
        vin: transaction.vin.map(input => normalizeInput(input)),
        vout: transaction.vout.map(output => normalizeOutput(output)),
        scripts: transaction.scripts,
        systemFee: transaction.systemFee,
        networkFee: transaction.networkFee,
        nonce: transaction.nonce,
      };
    case 'IssueTransaction':
      return {
        type: 'IssueTransaction',
        txid: normalizeHash(transaction.txid),
        size: transaction.size,
        version: transaction.version,
        attributes: transaction.attributes.map(attribute =>
          normalizeAttribute(attribute),
        ),
        vin: transaction.vin.map(input => normalizeInput(input)),
        vout: transaction.vout.map(output => normalizeOutput(output)),
        scripts: transaction.scripts,
        systemFee: transaction.systemFee,
        networkFee: transaction.networkFee,
      };
    case 'ClaimTransaction':
      return {
        type: 'ClaimTransaction',
        txid: normalizeHash(transaction.txid),
        size: transaction.size,
        version: transaction.version,
        attributes: transaction.attributes.map(attribute =>
          normalizeAttribute(attribute),
        ),
        vin: transaction.vin.map(input => normalizeInput(input)),
        vout: transaction.vout.map(output => normalizeOutput(output)),
        scripts: transaction.scripts,
        systemFee: transaction.systemFee,
        networkFee: transaction.networkFee,
        claims: transaction.claims.map(claim => normalizeInput(claim)),
      };
    case 'EnrollmentTransaction':
      return {
        type: 'EnrollmentTransaction',
        txid: normalizeHash(transaction.txid),
        size: transaction.size,
        version: transaction.version,
        attributes: transaction.attributes.map(attribute =>
          normalizeAttribute(attribute),
        ),
        vin: transaction.vin.map(input => normalizeInput(input)),
        vout: transaction.vout.map(output => normalizeOutput(output)),
        scripts: transaction.scripts,
        systemFee: transaction.systemFee,
        networkFee: transaction.networkFee,
        publicKey: transaction.publicKey,
      };
    case 'RegisterTransaction':
      return {
        type: 'RegisterTransaction',
        txid: normalizeHash(transaction.txid),
        size: transaction.size,
        version: transaction.version,
        attributes: transaction.attributes.map(attribute =>
          normalizeAttribute(attribute),
        ),
        vin: transaction.vin.map(input => normalizeInput(input)),
        vout: transaction.vout.map(output => normalizeOutput(output)),
        scripts: transaction.scripts,
        systemFee: transaction.systemFee,
        networkFee: transaction.networkFee,
        asset: transaction.asset,
      };
    case 'ContractTransaction':
      return {
        type: 'ContractTransaction',
        txid: normalizeHash(transaction.txid),
        size: transaction.size,
        version: transaction.version,
        attributes: transaction.attributes.map(attribute =>
          normalizeAttribute(attribute),
        ),
        vin: transaction.vin.map(input => normalizeInput(input)),
        vout: transaction.vout.map(output => normalizeOutput(output)),
        scripts: transaction.scripts,
        systemFee: transaction.systemFee,
        networkFee: transaction.networkFee,
      };
    case 'PublishTransaction':
      return {
        type: 'PublishTransaction',
        txid: normalizeHash(transaction.txid),
        size: transaction.size,
        version: transaction.version,
        attributes: transaction.attributes.map(attribute =>
          normalizeAttribute(attribute),
        ),
        vin: transaction.vin.map(input => normalizeInput(input)),
        vout: transaction.vout.map(output => normalizeOutput(output)),
        scripts: transaction.scripts,
        systemFee: transaction.systemFee,
        networkFee: transaction.networkFee,
        contract: normalizeContract(transaction.contract),
      };
    case 'InvocationTransaction':
      return {
        type: 'InvocationTransaction',
        txid: normalizeHash(transaction.txid),
        size: transaction.size,
        version: transaction.version,
        attributes: transaction.attributes.map(attribute =>
          normalizeAttribute(attribute),
        ),
        vin: transaction.vin.map(input => normalizeInput(input)),
        vout: transaction.vout.map(output => normalizeOutput(output)),
        scripts: transaction.scripts,
        systemFee: transaction.systemFee,
        networkFee: transaction.networkFee,
        script: transaction.script,
        gas: transaction.gas,
        data: normalizeInvocationData(transaction.data),
      };
    case 'StateTransaction':
      return {
        type: 'StateTransaction',
        txid: normalizeHash(transaction.txid),
        size: transaction.size,
        version: transaction.version,
        attributes: transaction.attributes.map(attribute =>
          normalizeAttribute(attribute),
        ),
        vin: transaction.vin.map(input => normalizeInput(input)),
        vout: transaction.vout.map(output => normalizeOutput(output)),
        scripts: transaction.scripts,
        systemFee: transaction.systemFee,
        networkFee: transaction.networkFee,
        descriptors: transaction.descriptors,
      };
    default:
      // eslint-disable-next-line
      (transaction.type: empty);
      throw new Error('Unknown transaction type');
  }
};

export default (block: Block): Block => ({
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
  transactions: block.transactions.map(transaction =>
    normalizeTransaction(transaction),
  ),
});
