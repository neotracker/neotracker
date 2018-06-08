/* @flow */
import {
  BIG_INT_ID,
  CONTRACT_VALIDATOR,
  INTEGER_INDEX_VALIDATOR,
} from './common';

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
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
    processed_action_global_index: {
      type: BIG_INT_ID,
      required: true,
    },
  };
}
