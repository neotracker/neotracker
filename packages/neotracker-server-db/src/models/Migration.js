/* @flow */
import BaseVisibleModel from './BaseVisibleModel';
import type { FieldSchema } from '../lib';

export default class Migration extends BaseVisibleModel<number> {
  id: number;
  name: string;
  complete: boolean;
  data: string;

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
    id: {
      type: { type: 'id', big: false },
      required: true,
      exposeGraphQL: true,
      auto: true,
    },
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
