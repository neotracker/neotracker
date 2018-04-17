/* @flow */
import {
  FileIRParser,
  FileWriter,
  IRTransforms,
  ConsoleReporter,
  Runner,
} from 'relay-compiler';
import { type GraphQLSchema, buildASTSchema, parse, print } from 'graphql';
import { Map as ImmutableMap } from 'immutable';

import appRootDir from 'app-root-dir';
import formatGeneratedModule from 'relay-compiler/lib/formatGeneratedModule';
import fs from 'fs-extra';
import path from 'path';
import stringify from 'safe-stable-stringify';

const WATCH_EXPRESSION = [
  'allof',
  ['type', 'f'],
  ['suffix', 'js'],
  ['not', ['match', '**/__mocks__/**', 'wholename']],
  ['not', ['match', '**/__tests__/**', 'wholename']],
  ['not', ['match', '**/__generated__/**', 'wholename']],
];

const OUTPUT_PATH = path.resolve(
  appRootDir.get(),
  'packages/neotracker-server-graphql/src/__generated__/queries.json',
);

type Current = {|
  current: Array<string>,
  reverseMap: { [key: string]: number },
  nextIndex: number,
|};

class QueryPersistor {
  queue: Array<{|
    resolve: (index: number) => void,
    reject: (error: Error) => void,
    text: string,
  |}>;
  processing: boolean;
  _current: ?Current;

  constructor() {
    this.queue = [];
    this.processing = false;
    this._current = null;
  }

  persistQuery = async (text: string): Promise<string> => {
    const index = await this._writeQueue(text);
    return `${index}`;
  };

  _writeQueue(text: string): Promise<number> {
    const promise = new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, text });
    });
    this._processQueue();

    return promise;
  }

  async _processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }
    this.processing = true;
    let { queue } = this;
    this.queue = [];
    while (queue.length > 0) {
      for (const { resolve, reject, text } of queue) {
        try {
          // eslint-disable-next-line
          const index = await this._writeOne(text);
          resolve(index);
        } catch (error) {
          reject(error);
        }
      }
      ({ queue } = this);
      this.queue = [];
    }

    this.processing = false;
  }

  async _writeOne(text: string): Promise<number> {
    const currentObject = await this._getCurrent();
    const { current, reverseMap } = currentObject;
    const { nextIndex } = currentObject;
    const normalizedText = print(parse(text));
    let index = reverseMap[normalizedText];
    if (index == null) {
      index = nextIndex;
      reverseMap[normalizedText] = nextIndex;
      current[nextIndex] = normalizedText;
      await fs.writeFile(OUTPUT_PATH, stringify(current));
      currentObject.nextIndex += 1;
    }

    return index;
  }

  async _getCurrent(): Promise<Current> {
    if (this._current == null) {
      const contents = await fs.readFile(OUTPUT_PATH, 'utf8');
      const currentIn = JSON.parse(contents);
      this._current = {
        current: currentIn,
        reverseMap: currentIn.reduce((acc, value, idx) => {
          acc[value] = idx;
          return acc;
        }, {}),
        nextIndex: currentIn.length + 1,
      };
    }

    return this._current;
  }
}

const getSchema = (schemaPath): GraphQLSchema => {
  try {
    let source = fs.readFileSync(schemaPath, 'utf8');
    source = `
  directive @include(if: Boolean) on FRAGMENT_SPREAD | FIELD
  directive @skip(if: Boolean) on FRAGMENT_SPREAD | FIELD
  ${source}
  `;
    return buildASTSchema(parse(source), { assumeValid: true });
  } catch (error) {
    throw new Error(
      `
Error loading schema. Expected the schema to be a .graphql file using the
GraphQL schema definition language. Error detail:
${error.stack}
    `.trim(),
    );
  }
};

const {
  commonTransforms,
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions,
} = IRTransforms;
const getRelayFileWriter = (baseDir: string) => ({
  onlyValidate,
  schema,
  documents,
  baseDocuments,
  sourceControl,
  reporter,
}) => {
  const queryPersistor = new QueryPersistor();
  return new FileWriter({
    config: {
      baseDir,
      compilerTransforms: {
        commonTransforms,
        codegenTransforms,
        fragmentTransforms,
        printTransforms,
        queryTransforms,
      },
      customScalars: {},
      formatModule: formatGeneratedModule,
      schemaExtensions,
      persistQuery: queryPersistor.persistQuery,
    },
    onlyValidate,
    schema,
    baseDocuments,
    documents,
    reporter,
    sourceControl,
  });
};

export type CodegenRunner = {
  clearAll: () => Promise<void>,
  watchAll: () => Promise<void>,
  compileAll: () => Promise<void>,
};
export default ({
  srcDirs,
  schemaPath,
}: {|
  srcDirs: Array<string>,
  schemaPath: string,
|}): CodegenRunner => {
  const createParserConfig = (dir: string) => ({
    baseDir: path.resolve(appRootDir.get(), dir),
    getFileFilter: (baseDir: string) => (file: Object) => {
      const text = fs.readFileSync(path.join(baseDir, file.relPath), 'utf8');
      return text.indexOf('graphql`') >= 0;
    },
    getParser: FileIRParser.getParser,
    getSchema: () => getSchema(path.resolve(appRootDir.get(), schemaPath)),
    watchmanExpression: WATCH_EXPRESSION,
  });
  const createWriterConfig = (dir: string) => ({
    getWriter: getRelayFileWriter(dir),
    isGeneratedFile: (filePath: string) =>
      filePath.endsWith('.js') && filePath.includes('__generated__'),
    parser: dir,
  });

  const parserConfigs = {};
  const writerConfigs = {};
  for (const dir of srcDirs) {
    parserConfigs[dir] = createParserConfig(dir);
    writerConfigs[dir] = createWriterConfig(dir);
  }

  const runner = new Runner({
    reporter: new ConsoleReporter({ verbose: true }),
    parserConfigs,
    writerConfigs,
    onlyValidate: false,
  });
  return {
    clearAll: async (): Promise<void> => {
      await runner.compileAll();
      for (const writerName of Object.keys(runner.writerConfigs)) {
        const { getWriter, parser, baseParsers } = runner.writerConfigs[
          writerName
        ];
        let baseDocuments = ImmutableMap();
        if (baseParsers) {
          baseParsers.forEach(baseParserName => {
            baseDocuments = baseDocuments.merge(
              runner.parsers[baseParserName].documents(),
            );
          });
        }

        // always create a new writer: we have to write everything anyways
        const documents = runner.parsers[parser].documents();
        const schema = runner.parserConfigs[parser].getSchema();
        const writer = getWriter({
          onlyValidate: false,
          schema,
          documents,
          baseDocuments,
        });
        // eslint-disable-next-line
        const outputDirectories = await writer.writeAll();
        for (const codegenDir of outputDirectories.keys()) {
          fs.removeSync(codegenDir);
        }
      }
    },
    watchAll: async (): Promise<void> => {
      await runner.watchAll();
    },
    compileAll: async (): Promise<void> => {
      await runner.compileAll();
    },
  };
};
