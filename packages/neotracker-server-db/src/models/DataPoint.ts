// tslint:disable variable-name
import { EMPTY, Observable } from 'rxjs';
import { FieldSchema } from '../lib';
import { GraphQLContext } from '../types';
import { BaseVisibleModel } from './BaseVisibleModel';

const DATA_POINT_TYPES: ReadonlyArray<string> = [
  // Virtual types, only available through PricesRootCall
  'ANStoBTC',
  'ANCtoBTC',
  'ANStoUSD',
  'ANCtoUSD',
];

export class DataPoint extends BaseVisibleModel<number> {
  public static readonly modelName = 'DataPoint';
  public static readonly exposeGraphQL: boolean = true;
  public static readonly fieldSchema: FieldSchema = {
    id: {
      type: { type: 'id', big: false },
      required: true,
      exposeGraphQL: true,
      auto: true,
    },

    type: {
      type: {
        type: 'string',
        enum: DATA_POINT_TYPES,
      },

      required: true,
      exposeGraphQL: true,
    },

    time: {
      type: { type: 'integer', minimum: 0 },
      required: true,
      exposeGraphQL: true,
    },

    value: {
      type: { type: 'decimal' },
      required: true,
      exposeGraphQL: true,
    },
  };

  // tslint:disable no-any
  public static observable$(_obj: any, _args: any, _context: GraphQLContext, _info: any): Observable<any> {
    return EMPTY;
  }
  // tslint:enable no-any

  public readonly type!: string;
  public readonly time!: number;
  public readonly value!: string;
}
