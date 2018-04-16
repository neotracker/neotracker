/* @flow */
import BaseVisibleModel from './BaseVisibleModel';
import type { FieldSchema } from '../lib';

export default class Migration extends BaseVisibleModel {
  static modelName = 'Migration';
  static exposeGraphQL: boolean = false;
  static indices = [
    {
      type: 'simple',
      columnNames: ['name'],
      name: 'name',
      unique: true,
    },
  ];

  static fieldSchema: FieldSchema = {
    name: {
      type: { type: 'string' },
      required: true,
    },
    complete: {
      type: { type: 'boolean' },
      required: true,
    },
    data: {
      type: { type: 'string' },
    },
  };
}
