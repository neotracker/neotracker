import * as appRootDir from 'app-root-dir';
import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';
import { Context } from '../../../../node/component/Context';
import { processFile } from '../../../../node/component/processFile';

describe('processFile', () => {
  const rootDir = path.resolve(__dirname, '..', '..', '..', '..');
  // tslint:disable-next-line readonly-array
  const realPath = (...filePath: string[]) => path.resolve(rootDir, 'shared', 'app', 'components', ...filePath);

  const testPath = (fileName: string) => path.resolve(rootDir, '__tests__', 'data', 'components', fileName);
  const testComponentPath = (name: string) => testPath(`${name}.tsx`);
  const testExamplesPath = (name: string) => testPath(`${name}.example.tsx`);

  const getTestCaseName = (filePath: string) => path.relative(rootDir, filePath);

  const TEST_TEST_CASES = [
    'ConstReExportProps',
    'ClassExportInlineProps',
    'ConstExportInlineProps',
    'ConstExportInterfaceProps',
    'DefaultExportInterfaceProps',
  ];

  const EXAMPLE_TEST_CASES = [realPath('explorer', 'ContentWrapper.example.tsx')].concat(
    TEST_TEST_CASES.map(testExamplesPath),
  );

  const COMPONENT_TEST_CASES = [realPath('explorer', 'ContentWrapper.tsx')].concat(
    TEST_TEST_CASES.map(testComponentPath),
  );

  let context: Context;
  beforeAll(() => {
    const tsconfigPath = path.resolve(appRootDir.get(), 'tsconfig.json');
    const basePath = path.dirname(tsconfigPath);
    const { config, error } = ts.readConfigFile(tsconfigPath, (filename) => fs.readFileSync(filename, 'utf8'));

    if (error !== undefined) {
      throw error;
    }

    const result = ts.parseJsonConfigFileContent(config, ts.sys, basePath, {}, tsconfigPath);

    if (result.errors.length > 0) {
      throw result.errors[0];
    }

    const filePaths = EXAMPLE_TEST_CASES.concat(COMPONENT_TEST_CASES);
    context = new Context({
      program: ts.createProgram(filePaths, result.options),
    });
  });

  const testExamples = (filePath: string) => {
    test(getTestCaseName(filePath), () => {
      const result = processFile({ context, filePath });

      expect(result.errors.length).toEqual(0);
      expect(result.components.length).toEqual(0);
      expect(result.examples.length).toBeGreaterThan(0);
      result.examples.forEach((example) => {
        expect(example.id).toMatchSnapshot('id');
        expect(example.example.code).toMatchSnapshot('code');
        expect(example.fixture.code).toMatchSnapshot('fixtureCode');
        expect(example.example.returnText).toMatchSnapshot('returnText');
        expect(example.fixture.returnText).toMatchSnapshot('fixtureReturnText');
        expect(example.exampleTemplate).toMatchSnapshot('exampleTemplate');
      });
    });
  };

  const testComponents = (filePath: string) => {
    test(getTestCaseName(filePath), () => {
      const result = processFile({ context, filePath });

      expect(result.errors.length).toEqual(0);
      expect(result.examples.length).toEqual(0);
      expect(result.components.length).toBeGreaterThan(0);
      result.components.forEach((component) => {
        expect(component.id).toMatchSnapshot('id');
        expect(component.displayName).toMatchSnapshot('displayName');
        expect(component.description).toMatchSnapshot('description');
        expect(component.dependencies).toMatchSnapshot('dependencies');
        expect(component.props).toMatchSnapshot('props');
        expect(component.renderAPI).toMatchSnapshot('renderAPI');
      });
    });
  };

  EXAMPLE_TEST_CASES.forEach((filePath) => {
    testExamples(filePath);
  });

  COMPONENT_TEST_CASES.forEach((filePath) => {
    testComponents(filePath);
  });
});
