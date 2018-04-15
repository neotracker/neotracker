/* @flow */
import { type Observable } from 'rxjs/Observable';

import { empty } from 'rxjs/observable/empty';

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

export default class DataPoint extends BaseVisibleModel {
  static modelName = 'DataPoint';
  static exposeGraphQL: boolean = true;
  static bigIntID = true;

  static fieldSchema: FieldSchema = {
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
