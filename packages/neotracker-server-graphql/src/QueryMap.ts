import * as appRootDir from 'app-root-dir';
import * as fs from 'fs-extra';
import { DocumentNode, parse } from 'graphql';
import _ from 'lodash';
import { CodedError } from 'neotracker-server-utils';
import { tryParseInt } from 'neotracker-shared-utils';
import * as path from 'path';

import queries from './__generated__/queries.json';

interface Queries {
  readonly [key: string]: string;
}

const queryCache: { [K in string]?: DocumentNode } = {};
export class QueryMap {
  private readonly next: boolean;
  private mutableQueries: Promise<Queries> | undefined;

  public constructor({ next }: { readonly next: boolean }) {
    this.next = next;
  }

  public async get(id: string): Promise<DocumentNode> {
    let queriesNextPromise = this.mutableQueries;
    if (queriesNextPromise === undefined) {
      this.mutableQueries = queriesNextPromise = this.loadQueries();
    }

    const queriesNext = await queriesNextPromise;

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
    const dir = path.resolve(
      appRootDir.get(),
      'packages',
      'neotracker-server-graphql',
      'src',
      '__generated__',
      'queries',
    );
    const exists = await fs.pathExists(dir);
    if (exists) {
      const files = await fs.readdir(dir);
      const hashAndContents = await Promise.all(
        files.map(async (fileName) => {
          const queryID = fileName.slice(0, -'.graphql'.length);
          const content = await fs.readFile(path.resolve(dir, fileName), 'utf8');

          return [queryID, content];
        }),
      );

      return _.fromPairs(hashAndContents);
    }

    return {};
  }
}
