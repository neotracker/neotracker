/* @flow */
import BaseVisibleModel from './BaseVisibleModel';
import type { FieldSchema } from '../lib';

export default class GraphQLQuery extends BaseVisibleModel {
  static modelName = 'GraphQLQuery';
  static exposeGraphQL: boolean = false;
  static indices = [
    {
      type: 'simple',
      columnNames: ['query'],
      name: 'query',
      unique: true,
    },
  ];

  static fieldSchema: FieldSchema = {
    query: {
      type: { type: 'string' },
      required: true,
    },
  };
}
