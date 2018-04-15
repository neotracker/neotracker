/* @flow */
import { CodedError } from 'neotracker-server-utils';
import { type DocumentNode, parse } from 'graphql';

import { tryParseInt } from 'neotracker-shared-utils';

// $FlowFixMe
import queries from './__generated__/queries.json';

const queryCache = ({}: { [id: string]: DocumentNode });
export default class QueryMap {
  async get(id: string): Promise<DocumentNode> {
    if (queryCache[id] == null) {
      const idParsed = tryParseInt({ value: id, default: null });
      if (idParsed == null) {
        throw new CodedError(CodedError.PROGRAMMING_ERROR);
      }

      const query = queries[idParsed];
      if (query == null) {
        throw new CodedError(CodedError.GRAPHQL_QUERY_NOT_FOUND_ERROR);
      }

      queryCache[id] = parse(query);
    }

    return queryCache[id];
  }
}
