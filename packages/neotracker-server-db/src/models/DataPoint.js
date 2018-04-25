/* @flow */
import { type Observable, empty } from 'rxjs';

import BaseVisibleModel from './BaseVisibleModel';
import { type FieldSchema } from '../lib';
import type { GraphQLContext } from '../types';

const DATA_POINT_TYPES = [
  // Virtual types, only available through PricesRootCall
  'ANStoBTC',
  'ANCtoBTC',
  'ANStoUSD',
  'ANCtoUSD',
];

export default class DataPoint extends BaseVisibleModel<number> {
  id: number;
  type: string;
  time: number;
  value: string;

  static modelName = 'DataPoint';
  static exposeGraphQL: boolean = true;
  static bigIntID = true;

  static fieldSchema: FieldSchema = {
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

  static observable(
    obj: Object,
    args: Object,
    context: GraphQLContext,
    // eslint-disable-next-line
    info: any,
  ): Observable<any> {
    return empty();
  }
}
