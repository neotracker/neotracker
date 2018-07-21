// @ts-ignore
import astTypes from 'ast-types';
import { Require } from '../types';

const b = astTypes.builders;

export const createRequireDefault = (filePath: string): Require => ({
  filePath,
  toAST: () =>
    b.memberExpression(b.callExpression(b.identifier('require'), [b.literal(filePath)]), b.identifier('default')),
});
