import { transform, Transform } from 'sucrase';
import { EvalInContext } from '../../../types';
import { splitExampleCode } from './splitExampleCode';

// tslint:disable-next-line readonly-array
const TRANSFORMS: Transform[] = ['typescript', 'imports', 'jsx'];

export const compileComponent = ({
  code,
  fixtureCode,
  evalInContext,
  exampleTemplate,
}: {
  readonly code: string;
  readonly fixtureCode: string;
  readonly evalInContext: EvalInContext;
  readonly exampleTemplate: string;
}) => {
  const { code: compiledCode } = transform(code, {
    transforms: TRANSFORMS,
  });
  const { code: compiledFixtureCode } = transform(fixtureCode, {
    transforms: TRANSFORMS,
  });

  const example = splitExampleCode({ code: compiledCode, fixtureCode: compiledFixtureCode, exampleTemplate });
  const withReact = `const React = require('react');\n${example}`;

  const evalExample = evalInContext(withReact)();

  return {
    element: evalExample.element,
    data: evalExample.data(),
  };
};
