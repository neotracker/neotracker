import _ from 'lodash';
import * as path from 'path';
import prettier from 'prettier';
import ts from 'typescript';
import { notNull } from '../../shared/utils';
import { PropInfo, RenderAPIInfo, REPLACE_DATA_ME, REPLACE_ME } from '../../types';
import { tsUtils } from '../tsUtils';
import { Context } from './Context';

export interface ComponentExample {
  readonly id: string;
  readonly exampleTemplate: string;
  readonly example: {
    readonly code: string;
    readonly returnText: string;
  };
  readonly fixture: {
    readonly code: string;
    readonly returnText: string;
  };
}
export interface Component {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly dependencies: ReadonlyArray<string>;
  readonly props: PropInfo;
  readonly renderAPI?: RenderAPIInfo;
}
export interface Result {
  readonly examples: ReadonlyArray<ComponentExample>;
  readonly components: ReadonlyArray<Component>;
  readonly errors: ReadonlyArray<string>;
}
const EMPTY_RESULT: Result = { examples: [], components: [], errors: [] };
const errorResult = (error: string) => ({
  ...EMPTY_RESULT,
  errors: [error],
});
const reduceResults = (results: ReadonlyArray<Result>): Result =>
  results.reduce(
    (acc: Result, result: Result) => ({
      examples: acc.examples.concat(result.examples),
      components: acc.components.concat(result.components),
      errors: acc.errors.concat(result.errors),
    }),
    EMPTY_RESULT,
  );

export const processFile = ({
  context,
  filePath,
}: {
  readonly context: Context;
  readonly filePath: string;
}): Result => {
  const sourceFile = context.program.getSourceFile(filePath);
  if (sourceFile === undefined) {
    return errorResult(`Something went wrong. Could not find source file for ${filePath}`);
  }

  const moduleSymbol = context.checker.getSymbolAtLocation(sourceFile);
  if (moduleSymbol === undefined) {
    return errorResult(`Something went wrong. Could not load module for ${filePath}`);
  }

  const results = context.checker
    .getExportsOfModule(moduleSymbol)
    .map((exp) => processExportedSymbol({ context, filePath, exp }));

  return reduceResults(results);
};

const processExportedSymbol = ({
  context,
  exp,
  filePath,
}: {
  readonly context: Context;
  readonly exp: ts.Symbol;
  readonly filePath: string;
}): Result => {
  const declaration = tsUtils.symbol.getValueDeclaration(exp);
  if (declaration === undefined) {
    const declarations = tsUtils.symbol.getDeclarations(exp);
    if (declarations.length > 0) {
      return EMPTY_RESULT;
    }

    return errorResult(
      `Something went wrong. Could not find declaration for exported symbol "${exp.getName()}" in file ${filePath}`,
    );
  }

  const localSymbol = tsUtils.node.getLocalSymbol(declaration);
  const symbol = localSymbol === undefined ? exp : localSymbol;
  const type = context.checker.getTypeOfSymbolAtLocation(symbol, declaration);
  if (isExamplesExport({ symbol, type })) {
    return processExamples({ context, filePath, declaration });
  }

  try {
    return processComponent({ context, filePath, symbol, exp, type });
  } catch (error) {
    return errorResult(error.stack);
  }
};

const isExamplesExport = ({ symbol, type }: { readonly symbol: ts.Symbol; readonly type: ts.Type }): boolean => {
  if (symbol.getName() !== 'examples') {
    return false;
  }

  const elements = tsUtils.types.getTupleElements(type);

  if (elements === undefined) {
    return false;
  }

  return elements.every((value) => {
    const elementSymbol = value.getSymbol();

    return elementSymbol !== undefined && elementSymbol.getName() === 'Example';
  });
};

const processExamples = ({
  context,
  filePath,
  declaration,
}: {
  readonly context: Context;
  readonly filePath: string;
  readonly declaration: ts.Node;
}): Result => {
  if (!ts.isVariableDeclaration(declaration)) {
    return EMPTY_RESULT;
  }

  const initializer = declaration.initializer;
  if (initializer === undefined) {
    return EMPTY_RESULT;
  }

  if (!ts.isArrayLiteralExpression(initializer)) {
    return errorResult(`Examples must be an array literal. Check the "examples" export of ${filePath}`);
  }

  if (!initializer.elements.every((element) => ts.isObjectLiteralExpression(element))) {
    return errorResult(
      `Examples must be an array literal of object expressions. Check the "examples" export of ${filePath}`,
    );
  }

  const results = initializer.elements.map((element, idx) => {
    if (!ts.isObjectLiteralExpression(element)) {
      throw new Error('For TS');
    }

    try {
      return {
        examples: [processExample({ context, filePath, idx, example: element })],
        components: [],
        errors: [],
      };
    } catch (error) {
      return errorResult(error.stack);
    }
  });

  return reduceResults(results);
};

const unsemicolon = (s: string) => s.replace(/;\s*$/, '');

const processExample = ({
  context,
  filePath,
  idx,
  example,
}: {
  readonly context: Context;
  readonly filePath: string;
  readonly idx: number;
  readonly example: ts.ObjectLiteralExpression;
}): ComponentExample => {
  const commonError = `Check the "element" function of example ${idx} in ${filePath}`;
  const dataError = `Check the "data" key of example ${idx} in ${filePath}`;

  const exampleFunc = tsUtils.node.getProperty(example, 'element');
  if (exampleFunc === undefined) {
    throw new Error(`Expected example to be an object literal with an "element" key. ${commonError}`);
  }

  if (!ts.isPropertyAssignment(exampleFunc)) {
    throw new Error(
      `Expected example to be an object literal with an "element" key that is a property assignment. ${commonError}`,
    );
  }

  const initializer = exampleFunc.initializer;
  if (!ts.isArrowFunction(initializer)) {
    throw new Error(
      `Expected example to be an object literal with an "element" key that is an arrow function. ${commonError}`,
    );
  }
  const fixtureData = tsUtils.node.getProperty(example, 'data');
  if (fixtureData !== undefined && !ts.isPropertyAssignment(fixtureData)) {
    throw new Error(
      `Expected example to be an object literal with a "data" key that is a property assignment. ${dataError}`,
    );
  }

  const fixtureInitializer = fixtureData === undefined ? undefined : fixtureData.initializer;
  if (fixtureInitializer !== undefined && !ts.isObjectLiteralExpression(fixtureInitializer)) {
    throw new Error(
      `Expected example to be an object literal with a "data" key that is an object literal. ${dataError}`,
    );
  }

  const fixtureCode =
    fixtureData === undefined
      ? ''
      : processDependencies({
          dependencies: getDependencies({ context, node: fixtureData, filePath }),
        });

  const exampleTemplate = `{
    element: (ref) => {
      ${REPLACE_ME}
    },
    data: () => {
      ${REPLACE_DATA_ME}
    },
  }`;

  const body = initializer.body;
  if (tsUtils.guards.isExpression(body)) {
    const code = processDependencies({ dependencies: getDependencies({ context, node: body, filePath }) });
    const returnValue = ts.isParenthesizedExpression(body) ? body.expression : body;
    const id = getExampleComponentID({ context, idx, filePath, example, returnValue });

    return {
      id,
      exampleTemplate,
      example: {
        code,
        returnText: unsemicolon(format(returnValue.getText())),
      },
      fixture: {
        code: fixtureCode,
        // NOTE: We don't call format because fixture is a floating object literal and format expects valid code
        returnText: fixtureInitializer === undefined ? '{}' : fixtureInitializer.getText(),
      },
    };
  }

  if (ts.isBlock(body)) {
    const returnStatements = body.statements.filter((statement) => ts.isReturnStatement(statement));
    if (returnStatements.length > 1) {
      throw new Error(
        `Example element function can only have one return statement, found ${returnStatements.length}. ${commonError}`,
      );
    }
    if (returnStatements.length !== 1) {
      throw new Error(`Missing example return. ${commonError}`);
    }

    const returnStatement = returnStatements[0];
    if (!ts.isReturnStatement(returnStatement)) {
      throw new Error('For TS');
    }

    const returnValueIn = returnStatement.expression;
    if (returnValueIn === undefined) {
      throw new Error(`Example must have a return value. ${commonError}`);
    }

    const returnValue = ts.isParenthesizedExpression(returnValueIn) ? returnValueIn.expression : returnValueIn;

    const otherStatements = body.statements.filter((statement) => !ts.isReturnStatement(statement));
    const dependencies = body.statements
      .reduce(
        (acc: ReadonlyArray<ts.Node>, statement) => acc.concat(getDependencies({ context, node: statement, filePath })),
        [],
      )
      .concat(otherStatements);
    const code = processDependencies({ dependencies });
    const id = getExampleComponentID({ context, idx, filePath, example, returnValue });

    return {
      id,
      exampleTemplate,
      example: {
        code,
        returnText: unsemicolon(format(returnValue.getText())),
      },
      fixture: {
        code: fixtureCode,
        // NOTE: We don't call format because fixture is a floating object literal and format expects valid code
        returnText: fixtureInitializer === undefined ? '{}' : fixtureInitializer.getText(),
      },
    };
  }

  throw new Error(`Something went wrong processing the "element" function of example ${idx} in ${filePath}`);
};

const getExampleComponentID = ({
  context,
  idx,
  filePath,
  example,
  returnValue,
}: {
  readonly context: Context;
  readonly idx: number;
  readonly filePath: string;
  readonly example: ts.ObjectLiteralExpression;
  readonly returnValue: ts.Expression;
}): string => {
  const component = tsUtils.node.getProperty(example, 'component');
  let identifier: ts.Node | undefined;
  if (component !== undefined && ts.isPropertyAssignment(component)) {
    let initializer = component.initializer;
    if (ts.isAsExpression(initializer)) {
      initializer = initializer.expression;
    }

    if (ts.isIdentifier(initializer)) {
      identifier = initializer;
    }
  }

  if (identifier === undefined && (ts.isJsxElement(returnValue) || ts.isJsxSelfClosingElement(returnValue))) {
    identifier = ts.isJsxElement(returnValue) ? returnValue.openingElement.tagName : returnValue.tagName;
  }

  if (identifier !== undefined) {
    let symbol = context.checker.getSymbolAtLocation(identifier);
    if (symbol !== undefined) {
      try {
        symbol = context.checker.getAliasedSymbol(symbol);
      } catch {
        // do nothing
      }

      const declaration = tsUtils.symbol.getDeclaration(symbol);
      if (declaration !== undefined) {
        const sourceFile = declaration.getSourceFile();

        return makeComponentID({ context, filePath: sourceFile.fileName, name: symbol.name });
      }
    }
  }

  throw new Error(`Could not determine component for example ${idx} in ${filePath}.`);
};

const processDependencies = ({ dependencies }: { readonly dependencies: ReadonlyArray<ts.Node> }) => {
  const declarations = _.orderBy(_.uniq(dependencies), (dep) => dep.pos);
  const allCode = declarations.reduce((code, declaration) => code + declaration.getFullText(), '').trim();

  return format(allCode);
};

const format = (code: string): string =>
  prettier.format(code, {
    printWidth: 80,
    trailingComma: 'all',
    singleQuote: true,
    arrowParens: 'always',
    parser: 'typescript',
  });

const getDependencies = (
  options: { readonly context: Context; readonly node: ts.Node; readonly filePath: string },
  current: ReadonlyArray<ts.Node> = [],
): ReadonlyArray<ts.Node> => {
  const { context, node, filePath } = options;
  const identifiers = getIdentifiers({ node });
  const symbols = [
    ...new Set(identifiers.map((identifier) => context.checker.getSymbolAtLocation(identifier)).filter(notNull)),
  ];

  const next = symbols.map((symbol) => getDeclaration({ context, symbol, filePath })).filter(notNull);
  const final: ReadonlyArray<ts.Node> = _.uniq(current.concat(next));

  if (final.length === current.length) {
    return final;
  }

  return next.reduce((acc, nextNode) => getDependencies({ ...options, node: nextNode }, acc), final);
};

const getIdentifiers = ({
  node,
  mutableIdentifiers = [],
}: {
  readonly node: ts.Node;
  mutableIdentifiers?: ts.Identifier[];
}): ReadonlyArray<ts.Identifier> => {
  node.forEachChild((child) => {
    if (ts.isIdentifier(child)) {
      mutableIdentifiers.push(child);
    }

    getIdentifiers({ node: child, mutableIdentifiers });
  });

  return mutableIdentifiers;
};

const getDeclaration = ({
  context,
  symbol,
  filePath,
}: {
  readonly context: Context;
  readonly symbol: ts.Symbol;
  readonly filePath: string;
}): ts.Node | undefined => {
  const declaration = getDeclarationBase({ context, symbol });
  if (declaration === undefined) {
    return declaration;
  }

  const modifiers: ReadonlyArray<ts.Modifier> = declaration.modifiers === undefined ? [] : declaration.modifiers;
  if (modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword)) {
    return undefined;
  }

  if (declaration.getSourceFile().fileName !== filePath) {
    return undefined;
  }

  return declaration;
};

const getDeclarationBase = ({
  symbol,
}: {
  readonly context: Context;
  readonly symbol: ts.Symbol;
}): ts.Node | undefined => {
  const declaration = tsUtils.symbol.getDeclaration(symbol);
  if (declaration === undefined) {
    return undefined;
  }

  if (ts.isImportSpecifier(declaration)) {
    return declaration.parent.parent.parent;
  }

  if (ts.isImportClause(declaration)) {
    return declaration.parent;
  }

  if (ts.isVariableDeclaration(declaration)) {
    return declaration.parent.parent;
  }

  if (tsUtils.guards.isStatement(declaration)) {
    return declaration;
  }

  return undefined;
};

const processComponent = ({
  context,
  exp,
  symbol,
  type,
  filePath,
}: {
  readonly context: Context;
  readonly exp: ts.Symbol;
  readonly symbol: ts.Symbol;
  readonly type: ts.Type;
  readonly filePath: string;
}): Result => {
  const propsStateless = extractPropsFromStateless({ context, type });
  const propsStateful = propsStateless === undefined ? extractPropsFromStateful({ context, type }) : propsStateless;
  const props = propsStateful === undefined ? extractPropsFromType({ context, type }) : propsStateful;
  if (props !== undefined) {
    const component = {
      id: makeComponentID({ context, filePath, name: exp.getName() }),
      displayName: computeComponentName({ exp, filePath }),
      description: getFullJSDocComment({ context, symbol }).fullComment,
      dependencies: [],
      props: getPropsInfo({ context, props }),
      renderAPI: undefined,
    };

    return {
      examples: [],
      components: [component],
      errors: [],
    };
  }

  return EMPTY_RESULT;
};

const computeComponentName = ({ exp, filePath }: { readonly exp: ts.Symbol; readonly filePath: string }) => {
  const exportName = exp.getName();

  if (exportName === 'default') {
    // Default export for a file: named after file
    const name = path.basename(filePath, path.extname(filePath));

    return name === 'index' ? path.basename(path.dirname(filePath)) : name;
  }

  return exportName;
};

interface Props {
  readonly symbol: ts.Symbol;
  readonly type: ts.Type;
  readonly ignoreChildren: boolean;
  readonly defaultProps: { readonly [key: string]: string };
}

const extractPropsFromStateless = ({
  context,
  type,
}: {
  readonly context: Context;
  readonly type: ts.Type;
}): Props | undefined => {
  const callSignatures = type.getCallSignatures();

  if (callSignatures.length === 0) {
    return undefined;
  }

  // tslint:disable-next-line no-loop-statement
  for (const sig of callSignatures) {
    const params = sig.getParameters();
    if (params.length === 0) {
      continue;
    }

    const propsParam = params[0];
    if (
      (propsParam.name === 'props' || params.length === 1) &&
      tsUtils.symbol.getValueDeclaration(propsParam) !== undefined
    ) {
      const propsType = context.checker.getTypeOfSymbolAtLocation(propsParam, propsParam.valueDeclaration);

      const value = propsParam.valueDeclaration;
      let defaultProps = {};
      if (ts.isParameter(value) && ts.isObjectBindingPattern(value.name)) {
        defaultProps = getPropMapFromElements({ elements: value.name.elements });
      }

      // tslint:disable-next-line:no-bitwise
      if ((propsType.getFlags() & ts.TypeFlags.Any) === 0) {
        if (propsType.isIntersection() && propsType.types.length === 2 && propsType.types[0].getProperty('children')) {
          return {
            symbol: propsParam,
            type: propsType.types[1],
            ignoreChildren: false,
            defaultProps,
          };
        }

        return {
          symbol: propsParam,
          type: propsType,
          ignoreChildren: true,
          defaultProps,
        };
      }
    }
  }

  return undefined;
};

const extractPropsFromStateful = ({
  context,
  type,
}: {
  readonly context: Context;
  readonly type: ts.Type;
}): Props | undefined => {
  const constructSignatures = type.getConstructSignatures();
  if (constructSignatures.length === 0) {
    return undefined;
  }

  // tslint:disable-next-line no-loop-statement
  for (const sig of constructSignatures) {
    const params = sig.getParameters();
    if (params.length === 0) {
      continue;
    }

    const propsParam = params[0];
    const value = tsUtils.symbol.getValueDeclaration(propsParam);
    if (value !== undefined && (propsParam.name === 'props' || params.length === 1)) {
      const propsType = context.checker.getTypeOfSymbolAtLocation(propsParam, value);

      let defaultProps = {};
      if (ts.isParameter(value) && ts.isObjectBindingPattern(value.name)) {
        defaultProps = getPropMapFromElements({ elements: value.name.elements });
      }

      // tslint:disable-next-line:no-bitwise
      if ((propsType.getFlags() & ts.TypeFlags.Any) === 0) {
        return {
          symbol: propsParam,
          type: propsType,
          ignoreChildren: false,
          defaultProps,
        };
      }
    }
  }

  // tslint:disable-next-line no-loop-statement
  for (const sig of constructSignatures) {
    const instanceType = sig.getReturnType();
    const props = instanceType.getProperty('props');

    if (props !== undefined) {
      const value = tsUtils.symbol.getValueDeclaration(props);
      if (value !== undefined) {
        const propsType = context.checker.getTypeOfSymbolAtLocation(props, value);
        if (propsType.isIntersection() && propsType.types.length === 2 && propsType.types[0].getProperty('children')) {
          return {
            symbol: props,
            type: propsType.types[1],
            ignoreChildren: false,
            defaultProps: {},
          };
        }

        return {
          symbol: props,
          type: propsType,
          ignoreChildren: true,
          defaultProps: {},
        };
      }
    }
  }

  return undefined;
};

const extractPropsFromType = ({ type }: { readonly context: Context; readonly type: ts.Type }): Props | undefined => {
  const props = type.aliasSymbol;
  if (
    props !== undefined &&
    props.getName() === 'ComponentType' &&
    type.aliasTypeArguments !== undefined &&
    type.aliasTypeArguments.length === 1
  ) {
    const propsType = type.aliasTypeArguments[0];

    return {
      symbol: props,
      type: propsType,
      ignoreChildren: true,
      defaultProps: {},
    };
  }

  return undefined;
};

const getPropMapFromElements = ({
  elements,
}: {
  readonly elements: ts.NodeArray<ts.BindingElement>;
}): { readonly [key: string]: string } =>
  elements.reduce<{ readonly [key: string]: string }>((acc, property) => {
    if (!property.initializer || !ts.isIdentifier(property.name)) {
      return acc;
    }

    const literalValue = tsUtils.node.getLiteralValue(property.initializer);
    const propertyName = tsUtils.node.getName(property.name);

    if (literalValue !== undefined && propertyName !== undefined) {
      return {
        ...acc,
        [propertyName]: typeof literalValue === 'string' ? literalValue : `${literalValue}`,
      };
    }

    return acc;
  }, {});

const BANNED_PROP_NAMES = new Set(['unstable_observedBits']);

const getPropsInfo = ({ context, props }: { readonly context: Context; readonly props: Props }): PropInfo => {
  const propertiesOfProps = props.type.getProperties();

  return propertiesOfProps.reduce<PropInfo>((acc, prop) => {
    const propName = prop.getName();
    if (BANNED_PROP_NAMES.has(propName)) {
      return acc;
    }

    const value = tsUtils.symbol.getDeclaration(props.symbol);
    if (value === undefined) {
      return acc;
    }

    const propType = context.checker.getTypeOfSymbolAtLocation(prop, value);
    const propTypeString = context.checker.typeToString(propType);

    return {
      ...acc,
      [propName]: {
        defaultValue: props.defaultProps[propName],
        description: findDocComment({ context, symbol: prop }).fullComment,
        required: !tsUtils.symbol.isOptional(prop),
        type: propTypeString,
      },
    };
  }, {});
};

interface JSDoc {
  readonly description: string;
  readonly fullComment: string;
  readonly tags: { readonly [key: string]: string };
}

const DEFAULT_JS_DOC: JSDoc = {
  description: '',
  fullComment: '',
  tags: {},
};

const findDocComment = ({ context, symbol }: { readonly context: Context; readonly symbol: ts.Symbol }): JSDoc => {
  const comment = getFullJSDocComment({ context, symbol });
  if (comment.fullComment) {
    return comment;
  }

  const rootSymbols = context.checker.getRootSymbols(symbol);
  const commentsOnRootSymbols = rootSymbols
    .filter((sym) => sym !== symbol)
    .map((sym) => getFullJSDocComment({ context, symbol: sym }))
    .filter((jsdocComment) => !!jsdocComment.fullComment);

  if (commentsOnRootSymbols.length) {
    return commentsOnRootSymbols[0];
  }

  return DEFAULT_JS_DOC;
};

const getFullJSDocComment = ({ context, symbol }: { readonly context: Context; readonly symbol: ts.Symbol }): JSDoc => {
  // in some cases this can be undefined (Pick<Type, 'prop1'|'prop2'>)
  // tslint:disable-next-line no-any
  if ((symbol.getDocumentationComment as undefined | any) === undefined) {
    return DEFAULT_JS_DOC;
  }

  const mainComment = ts.displayPartsToString(symbol.getDocumentationComment(context.checker));

  // tslint:disable-next-line no-any
  const tags = (symbol.getJsDocTags() as undefined | any) === undefined ? [] : symbol.getJsDocTags();

  const mutableTagComments: string[] = [];
  const mutableTagMap: { [key: string]: string } = {};

  tags.forEach((tag) => {
    const trimmedText = tag.text === undefined ? '' : tag.text.trim();
    const currentValue = mutableTagMap[tag.name];
    mutableTagMap[tag.name] = currentValue ? `${currentValue}\n${trimmedText}` : trimmedText;

    if (tag.name !== 'default') {
      mutableTagComments.push(formatTag(tag));
    }
  });

  return {
    description: mainComment,
    fullComment: `${mainComment}\n${mutableTagComments.join('\n')}`.trim(),
    tags: mutableTagMap,
  };
};

const formatTag = (tag: ts.JSDocTagInfo) => `@${tag.name}${tag.text === undefined ? '' : ` ${tag.text}`}`;

const makeComponentID = ({
  context,
  filePath,
  name,
}: {
  readonly context: Context;
  readonly filePath: string;
  readonly name: string;
}) => `${path.relative(context.program.getCurrentDirectory(), filePath)}:${name}`;
