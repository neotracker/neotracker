import { CodedError } from '@neotracker/server-utils';
import { tryParseInt } from '@neotracker/shared-utils';
import * as fs from 'fs-extra';
import { DocumentNode, parse } from 'graphql';
import _ from 'lodash';
import * as path from 'path';

type Queries = ReadonlyArray<string>;
interface QueriesNext {
  readonly [key: string]: string;
}

const queryCache: { [K in string]?: DocumentNode } = {};
export class QueryMap {
  public readonly next: boolean;
  private readonly queriesPath: string;
  private readonly nextQueriesDir: string;
  private mutableQueries: Promise<Queries> | undefined;
  private mutableQueriesNext: Promise<QueriesNext> | undefined;

  public constructor({
    next,
    queriesPath,
    nextQueriesDir,
  }: {
    readonly next: boolean;
    readonly queriesPath: string;
    readonly nextQueriesDir: string;
  }) {
    this.next = next;
    this.queriesPath = queriesPath;
    this.nextQueriesDir = nextQueriesDir;
  }

  public async get(id: string): Promise<DocumentNode> {
    let queriesPromise = this.mutableQueries;
    if (queriesPromise === undefined) {
      this.mutableQueries = queriesPromise = this.loadQueries();
    }

    let queriesNextPromise = this.mutableQueriesNext;
    if (queriesNextPromise === undefined) {
      this.mutableQueriesNext = queriesNextPromise = this.loadQueriesNext();
    }

    const [queries, queriesNext] = await Promise.all([queriesPromise, queriesNextPromise]);

    const doc = queryCache[id];
    if (doc === undefined) {
      let query: string | undefined;
      if (this.next) {
        query = queriesNext[id];
      } else {
        const idParsed = tryParseInt({ value: id, default: undefined });
        if (idParsed == undefined) {
          throw new CodedError(CodedError.PROGRAMMING_ERROR);
        }

        // tslint:disable-next-line no-any
        query = queries[idParsed] as any;
      }

      if (query === undefined) {
        throw new CodedError(CodedError.GRAPHQL_QUERY_NOT_FOUND_ERROR);
      }

      const document = parse(query);
      // tslint:disable-next-line no-object-mutation
      queryCache[id] = document;

      return document;
    }

    return doc;
  }

  private async loadQueries(): Promise<Queries> {
    const exists = await fs.pathExists(this.queriesPath);
    if (exists) {
      const queries = await fs.readFile(this.queriesPath, 'utf8');

      return JSON.parse(queries);
    }

    return [];
  }

  private async loadQueriesNext(): Promise<QueriesNext> {
    const exists = await fs.pathExists(this.nextQueriesDir);
    if (exists) {
      const files = await fs.readdir(this.nextQueriesDir);
      const hashAndContents = await Promise.all(
        files.map(async (fileName) => {
          const queryID = fileName.slice(0, -'.graphql'.length);
          const content = await fs.readFile(path.resolve(this.nextQueriesDir, fileName), 'utf8');

          return [queryID, content];
        }),
      );

      return _.fromPairs(hashAndContents);
    }

    return {};
  }
}
