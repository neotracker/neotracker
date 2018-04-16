/* @flow */
import type { Connection, Paging } from 'neotracker-shared-graphql';
import type { QueryBuilder } from 'objection';

const getPagingArguments = (
  paging: Paging,
): ?{ forward: boolean, offset: ?number, limit: number } => {
  if (paging.first != null) {
    return {
      forward: true,
      offset: paging.after == null ? null : parseInt(paging.after, 10),
      limit: paging.first,
    };
  } else if (paging.last != null) {
    return {
      forward: false,
      offset: paging.before == null ? null : parseInt(paging.before, 10),
      limit: paging.last,
    };
  }

  return null;
};

export default async ({
  builder,
  paging,
}: {|
  builder: QueryBuilder,
  paging: Paging,
|}): Connection<*> => {
  const pagingArguments = getPagingArguments(paging);
  let pageInfo;
  if (pagingArguments) {
    const { forward, offset, limit } = pagingArguments;
    if (forward) {
      const newOffset = offset == null ? 0 : offset + 1;

      const results = await builder.offset(newOffset).limit(limit + 1);

      const edges = results.slice(0, limit);
      return {
        edges: edges.map((result, idx) => ({
          cursor: `${newOffset + idx}`,
          node: result,
        })),
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: results.length === limit + 1,
          endCursor: `${newOffset + (edges.length - 1)}`,
        },
      };
    }

    const start = offset == null ? 0 : offset - limit - 1;
    const actualStart = Math.max(start, 0);
    pageInfo = {
      hasPreviousPage: start > 0,
      hasNextPage: false,
      startCursor: `${actualStart}`,
    };

    const results = await builder
      .offset(actualStart)
      .limit(actualStart + limit);

    return {
      edges: results.map((result, idx) => ({
        cursor: `${actualStart + idx}`,
        node: result,
      })),
      pageInfo,
    };
  }

  const results = await builder;
  return {
    edges: results.map((result, idx) => ({
      cursor: `${idx}`,
      node: result,
    })),
    pageInfo: {
      hasPreviousPage: false,
      hasNextPage: false,
    },
  };
};
