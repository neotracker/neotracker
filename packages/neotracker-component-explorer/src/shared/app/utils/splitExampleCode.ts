// @ts-ignore
import * as acorn from 'acorn';
import _ from 'lodash';
import { REPLACE_ME } from '../../../types';

// Strip semicolon (;) at the end
const unsemicolon = (s: string) => s.replace(/;\s*$/, '');

export const splitExampleCode = ({
  code,
  exampleTemplate,
}: {
  readonly code: string;
  readonly exampleTemplate: string;
}): { readonly head: string; readonly example: string } => {
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2019 });
  } catch {
    return { head: '', example: code };
  }

  const firstExpression: { start: number; end: number } | undefined = _.find(ast.body.reverse(), {
    type: 'ExpressionStatement',
    // tslint:disable-next-line no-any
  }) as any;
  if (!firstExpression) {
    return { head: '', example: code };
  }

  const { start, end } = firstExpression;
  const head = unsemicolon(code.substring(0, start));
  const firstExpressionCode = unsemicolon(code.substring(start, end));
  const example = `${head};\nreturn (${firstExpressionCode});`;

  return {
    head,
    example: `return ${exampleTemplate.replace(REPLACE_ME, example)};`,
  };
};
