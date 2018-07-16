// tslint:disable no-useless-cast
export const BIG_INT_ID = { type: 'bigInteger' as 'bigInteger', minimum: 0 };
export const HASH_VALIDATOR = { type: 'string' as 'string', minLength: 64, maxLength: 64 };
export const NONCE_VALIDATOR = { type: 'string' as 'string', minLength: 16, maxLength: 16 };
export const ADDRESS_VALIDATOR = {
  type: 'string' as 'string',
  minLength: 34,
  maxLength: 34,
};

export const CONTRACT_VALIDATOR = {
  type: 'string' as 'string',
  minLength: 40,
  maxLength: 40,
};

export const ASSET_HASH_VALIDATOR = {
  type: 'string' as 'string',
  minLength: 40,
  maxLength: 64,
};

export const INTEGER_INDEX_VALIDATOR = { type: 'integer' as 'integer', minimum: 0 };
export const BLOCK_ID_VALIDATOR = { type: 'integer' as 'integer', minimum: -1 };

export const BLOCK_TIME_VALIDATOR = { type: 'integer' as 'integer', minimum: 0 };
export const BLOCK_TIME_COLUMN = {
  type: { type: 'integer' as 'integer', minimum: 0 },
  required: true,
  exposeGraphQL: true,
};

export const TYPE_INPUT = 'INPUT';
export const TYPE_DUPLICATE_CLAIM = 'DUPLICATE_CLAIM';
export const SUBTYPE_NONE = 'NONE';
export const SUBTYPE_ISSUE = 'ISSUE';
export const SUBTYPE_ENROLLMENT = 'ENROLLMENT';
export const SUBTYPE_CLAIM = 'CLAIM';
export const SUBTYPE_REWARD = 'REWARD';
export const NEP5_CONTRACT_TYPE = 'NEP5';
export const NEP5_BLACKLIST_CONTRACT_TYPE = 'NEP5_BLACKLIST';
export const UNKNOWN_CONTRACT_TYPE = 'UNKNOWN';
