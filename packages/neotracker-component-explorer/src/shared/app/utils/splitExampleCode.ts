// @ts-ignore
import * as acorn from 'acorn';
import _ from 'lodash';
import { REPLACE_DATA_ME, REPLACE_ME } from '../../../types';

// Strip semicolon (;) at the end
const unsemicolon = (s: string) => s.replace(/;\s*$/, '');

export const splitExampleCode = ({
  code,
  fixtureCode,
  exampleTemplate,
}: {
  readonly code: string;
  readonly fixtureCode: string;
  readonly exampleTemplate: string;
}): string => {
  const example = parseCode({ code });
  const fixtureExample = parseCode({ code: fixtureCode });

  return `return ${exampleTemplate.replace(REPLACE_ME, example).replace(REPLACE_DATA_ME, fixtureExample)};`;
};

const parseCode = ({ code }: { readonly code: string }): string => {
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2019 });
  } catch {
    return code;
  }
  const firstExpression: { start: number; end: number } | undefined = _.find(
    // tslint:disable-next-line no-any
    (ast as any).body.reverse(),
    (line) => line.type === 'ExpressionStatement' || line.type === 'BlockStatement',
  );
  if (!firstExpression) {
    return code;
  }

  const { start, end } = firstExpression;
  const head = unsemicolon(code.substring(0, start));
  const firstExpressionCode = unsemicolon(code.substring(start, end));

  return `${head};\nreturn (${firstExpressionCode});`;
};
