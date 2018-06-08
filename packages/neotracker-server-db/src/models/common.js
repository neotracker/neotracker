/* @flow */
export const BIG_INT_ID = { type: 'bigInteger', minimum: 0 };
export const HASH_VALIDATOR = { type: 'string', minLength: 64, maxLength: 64 };
export const NONCE_VALIDATOR = { type: 'string', minLength: 16, maxLength: 16 };
export const ADDRESS_VALIDATOR = {
  type: 'string',
  minLength: 34,
  maxLength: 34,
};
export const CONTRACT_VALIDATOR = {
  type: 'string',
  minLength: 40,
  maxLength: 40,
};
export const ASSET_HASH_VALIDATOR = {
  type: 'string',
  minLength: 40,
  maxLength: 64,
};
export const INTEGER_INDEX_VALIDATOR = { type: 'integer', minimum: 0 };

export const BLOCK_TIME_VALIDATOR = { type: 'integer', minimum: 0 };
export const BLOCK_TIME_COLUMN = {
  type: { type: 'integer', minimum: 0 },
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
export const UNKNOWN_CONTRACT_TYPE = 'UNKNOWN';
