/* @flow */
import { CONTRACT_VALIDATOR, INTEGER_INDEX_VALIDATOR } from './common';

import BaseVisibleModel from './BaseVisibleModel';
import { type FieldSchema } from '../lib';

export default class KnownContract extends BaseVisibleModel {
  static modelName = 'KnownContract';
  static exposeGraphQL: boolean = false;
  static indices = [
    {
      type: 'simple',
      columnNames: ['hash'],
      name: 'known_contract_hash',
      unique: true,
    },
  ];

  static fieldSchema: FieldSchema = {
    hash: {
      type: CONTRACT_VALIDATOR,
      required: true,
    },
    processed_block_index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
    processed_transaction_index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
    processed_action_index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
  };
}
