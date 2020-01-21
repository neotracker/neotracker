/* eslint-disable */
require('ts-node/register/transpile-only');
const {
  isIdentifier,
  isMemberExpression,
  isImportDefaultSpecifier,
  variableDeclaration,
  variableDeclarator,
  memberExpression,
  callExpression,
  identifier,
} = require('@babel/types');
const parseLiteral = require('babel-literal-to-ast');
const { parseExpression } = require('babylon');
const gql = require('graphql-tag');
const createDebug = require('debug');
const { ExtractGQL } = require('persistgraphql/lib/src/ExtractGQL');
const queryTransformers = require('persistgraphql/lib/src/queryTransformers');
const { queryPersistor } = require('../compiler');
const appRootDir = require('app-root-dir');
const path = require('path');

const debug = createDebug('babel-plugin-graphql-tag');

// eslint-disable-next-line no-restricted-syntax
const uniqueFn = parseExpression(`
  (definitions) => {
    const names = {};
    return definitions.filter(definition => {
      if (definition.kind !== 'FragmentDefinition') {
        return true;
      }
      const name = definition.name.value;
      if (names[name]) {
        return false;
      } else {
        names[name] = true;
        return true;
      }
    });
  }
`);

module.exports = () => {
  const compile = (path, uniqueId) => {
    const source = path.node.quasis.reduce((head, quasi) => {
      return head + quasi.value.raw;
    }, '');

    const expressions = path.get('expressions');

    expressions.forEach((expr) => {
      if (!isIdentifier(expr) && !isMemberExpression(expr)) {
        throw expr.buildCodeFrameError(
          'Only identifiers or member expressions are allowed by this plugin as an interpolation in a graphql template literal.',
        );
      }
    });

    debug('compiling a GraphQL query', source);

    const queryDocument = gql(source);

    const queries = Object.keys(
      new ExtractGQL({
        queryTransformers: [queryTransformers.addTypenameTransformer].filter(
          Boolean,
        ),
      }).createOutputMapFromString(source),
    );

    let persisted = false;
    queryDocument.definitions.forEach((op, idx) => {
      if (op.kind === 'OperationDefinition') {
        if (persisted) {
          throw new Error('Only one operation allowed per tag');
        }
        persisted = true;
        queryDocument.id = queryPersistor.persistQuery(queries[idx]);
      }
    });

    // If a document contains only one operation, that operation may be unnamed:
    // https://facebook.github.io/graphql/#sec-Language.Query-Document
    if (queryDocument.definitions.length > 1) {
      for (const definition of queryDocument.definitions) {
        if (!definition.name) {
          throw new Error('GraphQL query must have name.');
        }
      }
    }

    const body = parseLiteral(queryDocument);
    let uniqueUsed = false;

    if (expressions.length) {
      const definitionsProperty = body.properties.find((property) => {
        return property.key.value === 'definitions';
      });

      const definitionsArray = definitionsProperty.value;

      const extraDefinitions = expressions.map((expr) => {
        return memberExpression(expr.node, identifier('definitions'));
      });

      const allDefinitions = callExpression(
        memberExpression(definitionsArray, identifier('concat')),
        extraDefinitions,
      );

      definitionsProperty.value = callExpression(uniqueId, [allDefinitions]);

      uniqueUsed = true;
    }

    debug('created a static representation', body);

    return [body, uniqueUsed];
  };

  return {
    visitor: {
      Program(programPath) {
        const tagNames = [];
        const uniqueId = programPath.scope.generateUidIdentifier('unique');
        let uniqueUsed = false;

        programPath.traverse({
          ImportDeclaration(path) {
            if (path.node.source.value === 'graphql-tag') {
              const defaultSpecifier = path.node.specifiers.find(
                (specifier) => {
                  return isImportDefaultSpecifier(specifier);
                },
              );

              if (defaultSpecifier) {
                tagNames.push(defaultSpecifier.local.name);

                if (path.node.specifiers.length === 1) {
                  path.remove();
                } else {
                  path.node.specifiers = path.node.specifiers.filter(
                    (specifier) => {
                      return specifier !== defaultSpecifier;
                    },
                  );
                }
              }
            }
          },
          TaggedTemplateExpression(path) {
            if (
              tagNames.some((name) => {
                return isIdentifier(path.node.tag, { name });
              })
            ) {
              try {
                debug('quasi', path.node.quasi);

                const [body, used] = compile(path.get('quasi'), uniqueId);

                uniqueUsed = uniqueUsed || used;

                path.replaceWith(body);
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error('error', error);
              }
            }
          },
        });

        if (uniqueUsed) {
          programPath.unshiftContainer(
            'body',
            variableDeclaration('const', [
              variableDeclarator(uniqueId, uniqueFn),
            ]),
          );
        }
      },
    },
  };
};
