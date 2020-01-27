// tslint:disable
import * as appRootDir from 'app-root-dir';
import * as fs from 'fs-extra';
import { buildASTSchema, GraphQLSchema, parse, print } from 'graphql';
import { Map as ImmutableMap } from 'immutable';
import * as path from 'path';
// @ts-ignore
import { ConsoleReporter, FileIRParser, FileWriter, IRTransforms, Runner } from 'relay-compiler';
// tslint:disable no-submodule-imports
// @ts-ignore
import formatGeneratedModule from 'relay-compiler/lib/formatGeneratedModule';
// tslint:enable no-submodule-imports
import stringify from 'safe-stable-stringify';

const WATCH_EXPRESSION: ReadonlyArray<any> = [
  'allof',
  ['type', 'f'],
  ['suffix', 'js'],
  ['not', ['match', '**/__mocks__/**', 'wholename']],
  ['not', ['match', '**/__tests__/**', 'wholename']],
  ['not', ['match', '**/__generated__/**', 'wholename']],
];

const OUTPUT_PATH = path.resolve(appRootDir.get(), 'packages/neotracker-server-graphql/src/__generated__/queries.json');

interface ReverseMap {
  [key: string]: number;
}
interface Current {
  readonly current: string[];
  readonly reverseMap: ReverseMap;
  nextIndex: number;
}

class QueryPersistor {
  public queue: Array<{
    readonly resolve: (index: number) => void;
    readonly reject: (error: Error) => void;
    readonly text: string;
  }>;
  public processing: boolean;
  private current: Current | undefined;

  public constructor() {
    this.queue = [];
    this.processing = false;
  }

  public readonly persistQuery = async (text: string): Promise<string> => {
    const index = await this.writeQueue(text);
    return `${index}`;
  };

  private writeQueue(text: string): Promise<number> {
    const promise = new Promise<number>((resolve, reject) => {
      this.queue.push({ resolve, reject, text });
    });
    this.processQueue();

    return promise;
  }

  private async processQueue(): Promise<void> {
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
          const index = await this.writeOne(text);
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

  private async writeOne(text: string): Promise<number> {
    const currentObject = await this.getCurrent();
    const { current, reverseMap } = currentObject;
    const { nextIndex } = currentObject;
    const normalizedText = print(parse(text));
    let index = reverseMap[normalizedText];
    if (index == undefined) {
      index = nextIndex;
      reverseMap[normalizedText] = nextIndex;
      current[nextIndex] = normalizedText;
      await fs.writeFile(OUTPUT_PATH, stringify(current));
      currentObject.nextIndex += 1;
    }

    return index;
  }

  private async getCurrent(): Promise<Current> {
    if (this.current == undefined) {
      const contents = await fs.readFile(OUTPUT_PATH, 'utf8');
      const currentIn: string[] = JSON.parse(contents);
      this.current = {
        current: currentIn,
        reverseMap: currentIn.reduce<ReverseMap>((acc, value, idx) => {
          acc[value] = idx;
          return acc;
        }, {}),
        nextIndex: currentIn.length + 1,
      };
    }

    return this.current;
  }
}

const getSchema = (schemaPath: string): GraphQLSchema => {
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
}: any) => {
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
export interface CodegenRunner {
  readonly clearAll: () => Promise<void>;
  readonly watchAll: () => Promise<void>;
  readonly compileAll: () => Promise<void>;
}

export const createRelayCodegenRunner = (): CodegenRunner => {
  const srcDirs = ['./packages/neotracker-shared-web/src', './packages/neotracker-client-web/src'];
  const createParserConfig = (dir: string) => ({
    baseDir: path.resolve(appRootDir.get(), dir),
    getFileFilter: (baseDir: string) => (file: any) => {
      const text = fs.readFileSync(path.join(baseDir, file.relPath), 'utf8');
      return text.indexOf('graphql`') >= 0;
    },
    getParser: FileIRParser.getParser,
    getSchema: () =>
      getSchema(
        path.resolve(
          appRootDir.get(),
          'packages',
          'neotracker-server-graphql',
          'src',
          '__generated__',
          'schema.graphql',
        ),
      ),
    watchmanExpression: WATCH_EXPRESSION,
  });

  const createWriterConfig = (dir: string) => ({
    getWriter: getRelayFileWriter(dir),
    isGeneratedFile: (filePath: string) => filePath.endsWith('.js') && filePath.includes('__generated__'),
    parser: dir,
  });

  const parserConfigs: any = {};
  const writerConfigs: any = {};
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
        const { getWriter, parser, baseParsers } = runner.writerConfigs[writerName];

        let baseDocuments = ImmutableMap();
        if (baseParsers) {
          baseParsers.forEach((baseParserName: any) => {
            baseDocuments = baseDocuments.merge(runner.parsers[baseParserName].documents());
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
