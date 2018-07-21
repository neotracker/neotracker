// tslint:disable variable-name
import { pubsub } from '@neotracker/server-utils';
import { Observable } from 'rxjs';
import { PROCESSED_NEXT_INDEX } from '../createPubSub';
import { FieldSchema, IndexSchema } from '../lib';
import { GraphQLContext } from '../types';
import { BaseVisibleModel } from './BaseVisibleModel';
import { INTEGER_INDEX_VALIDATOR } from './common';

export class ProcessedIndex extends BaseVisibleModel<number> {
  public static readonly modelName = 'ProcessedIndex';
  public static readonly exposeGraphQL: boolean = false;
  public static readonly indices: ReadonlyArray<IndexSchema> = [
    {
      type: 'simple',
      columnNames: ['index'],
      name: 'processed_index_index',
      unique: true,
    },
  ];

  public static readonly fieldSchema: FieldSchema = {
    id: {
      type: { type: 'id', big: false },
      required: false,
      exposeGraphQL: true,
      auto: true,
    },

    index: {
      type: INTEGER_INDEX_VALIDATOR,
      required: true,
    },
  };

  // tslint:disable no-any
  public static observable$(_obj: any, _args: any, _context: GraphQLContext, _info: any): Observable<any> {
    return pubsub.observable$(PROCESSED_NEXT_INDEX);
  }
  // tslint:enable no-any

  public readonly index!: number;
}
