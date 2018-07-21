// @ts-ignore
import astTypes from 'ast-types';
import { Require } from '../types';

const b = astTypes.builders;

export const createRequire = (filePath: string): Require => ({
  filePath,
  toAST: () => b.callExpression(b.identifier('require'), [b.literal(filePath)]),
});
