// tslint:disable variable-name
import { FieldSchema } from '../lib';
import { BaseVisibleModel } from './BaseVisibleModel';
import { CONTRACT_VALIDATOR } from './common';

export class KnownContract extends BaseVisibleModel<string> {
  public static readonly modelName = 'KnownContract';
  public static readonly exposeGraphQL: boolean = false;
  public static readonly fieldSchema: FieldSchema = {
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

  public readonly processed_block_index!: number;
  public readonly processed_action_global_index!: string;
}
