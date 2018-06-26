import { DocumentNode, parse } from 'graphql';
import { CodedError } from 'neotracker-server-utils';
import { tryParseInt } from 'neotracker-shared-utils';

import queries from './__generated__/queries.json';

const queryCache: { [K in string]?: DocumentNode } = {};
export class QueryMap {
  public async get(id: string): Promise<DocumentNode> {
    let doc = queryCache[id];
    if (doc === undefined) {
      const idParsed = tryParseInt({ value: id, default: undefined });
      if (idParsed == undefined) {
        throw new CodedError(CodedError.PROGRAMMING_ERROR);
      }

      const query = queries[idParsed] as string | null | undefined;
      if (query == undefined) {
        throw new CodedError(CodedError.GRAPHQL_QUERY_NOT_FOUND_ERROR);
      }

      // tslint:disable-next-line no-object-mutation
      queryCache[id] = doc = parse(query);
    }

    return doc;
  }
}
