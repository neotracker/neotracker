/* @flow */
import { Model } from 'objection';

import {
  BIG_INT_ID,
  CONTRACT_VALIDATOR,
  HASH_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
} from './common';
import BlockchainModel from './BlockchainModel';
import { type EdgeSchema, type FieldSchema } from '../lib';

const ACTION_TYPES = ['Log', 'Notification'];

export type ActionType = 'Log' | 'Notification';

export default class Action extends BlockchainModel<string> {
  id: string;
  type: string;
  block_id: number;
  transaction_id: string;
  transaction_hash: string;
  transaction_index: number;
  index: number;
  script_hash: string;
  message: string;
  args_raw: string;

  static modelName = 'Action';
  static exposeGraphQL: boolean = true;
  static indices = [
    // TransactionActionPagingTable
    {
      type: 'order',
      columns: [
        {
          name: 'transaction_id',
          order: 'desc',
        },
        {
          name: 'index',
          order: 'asc',
        },
      ],
      name: 'action_transaction_id_index',
      unique: true,
    },
  ];

  static fieldSchema: FieldSchema = {
    id: {
      type: BIG_INT_ID,
      required: true,
      exposeGraphQL: true,
    },
    type: {
      type: { type: 'string', enum: ACTION_TYPES },
      required: true,
      exposeGraphQL: true,
    },
    block_id: {
      type: INTEGER_INDEX_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
    transaction_id: {
      type: BIG_INT_ID,
      exposeGraphQL: true,
      required: true,
    },
    transaction_hash: {
      type: HASH_VALIDATOR,
      exposeGraphQL: true,
      required: true,
    },
    transaction_index: {
      type: INTEGER_INDEX_VALIDATOR,
      exposeGraphQL: true,
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
          to: 'transfer.id',
        },
      },
      exposeGraphQL: true,
    },
  };
}
