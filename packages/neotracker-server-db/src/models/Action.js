/* @flow */
import { Model } from 'objection';

import { CONTRACT_VALIDATOR, INTEGER_INDEX_VALIDATOR } from './common';
import BlockchainModel from './BlockchainModel';
import { type EdgeSchema, type FieldSchema } from '../lib';

const ACTION_TYPES = ['Log', 'Notification'];

export type ActionType = 'Log' | 'Notification';

export default class Action extends BlockchainModel {
  static modelName = 'Action';
  static exposeGraphQL: boolean = true;
  static indices = [
    {
      type: 'simple',
      columnNames: ['block_index', 'transaction_index', 'index'],
      name: 'action_primary',
      unique: true,
    },
    {
      type: 'order',
      columns: [
        {
          name: 'transaction_id',
          order: 'desc nulls first',
        },
        {
          name: 'index',
          order: 'asc nulls last',
        },
      ],
      name: 'action_desc_transaction_id_asc_index',
    },
  ];
  static bigIntID = true;

  static fieldSchema: FieldSchema = {
    type: {
      type: { type: 'string', enum: ACTION_TYPES },
      required: true,
      exposeGraphQL: true,
    },
    block_index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
    transaction_id: {
      type: { type: 'foreignID', modelType: 'Transaction' },
      exposeGraphQL: true,
      required: true,
    },
    transaction_index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
    index: {
      type: INTEGER_INDEX_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
    script_hash: {
      type: CONTRACT_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
    message: {
      type: { type: 'string' },
      exposeGraphQL: true,
    },
    args_raw: {
      type: { type: 'string' },
      exposeGraphQL: true,
    },
  };

  static edgeSchema: EdgeSchema = {
    transaction: {
      relation: {
        relation: Model.BelongsToOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transaction').default;
        },
        join: {
          from: 'action.transaction_id',
          to: 'transaction.id',
        },
      },
      required: true,
      exposeGraphQL: true,
    },
    transfer: {
      relation: {
        relation: Model.HasOneRelation,
        get modelClass() {
          // eslint-disable-next-line
          return require('./Transfer').default;
        },
        join: {
          from: 'action.id',
          to: 'transfer.action_id',
        },
      },
      exposeGraphQL: true,
    },
  };
}
