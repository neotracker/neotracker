import { transform } from 'sucrase';
import { EvalInContext } from '../../../types';
import { splitExampleCode } from './splitExampleCode';

export const compileComponent = ({
  code,
  evalInContext,
  exampleTemplate,
}: {
  readonly code: string;
  readonly evalInContext: EvalInContext;
  readonly exampleTemplate: string;
}) => {
  const { code: compiledCode } = transform(code, { transforms: ['typescript', 'imports', 'jsx'] });
  const { example } = splitExampleCode({ code: compiledCode, exampleTemplate });

  const withReact = `const React = require('react');\n${example}`;

  return evalInContext(withReact)();
};
