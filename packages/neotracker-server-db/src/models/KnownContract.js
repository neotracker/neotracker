/* @flow */
import { CONTRACT_VALIDATOR } from './common';

import BaseVisibleModel from './BaseVisibleModel';
import { type FieldSchema } from '../lib';

export default class KnownContract extends BaseVisibleModel<string> {
  id: string;
  processed_action_global_index: string;

  static modelName = 'KnownContract';
  static exposeGraphQL: boolean = false;

  static fieldSchema: FieldSchema = {
    id: {
      type: CONTRACT_VALIDATOR,
      required: true,
      exposeGraphQL: true,
    },
    processed_block_index: {
      type: { type: 'integer', minimum: -1 },
      required: true,
    },
    processed_action_global_index: {
      type: { type: 'bigInteger', minimum: -1 },
      required: true,
    },
  };
}
