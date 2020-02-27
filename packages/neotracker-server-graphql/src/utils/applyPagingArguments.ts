import { Connection, isPagingFirst, isPagingLast, Paging } from '@neotracker/shared-graphql';
import { QueryBuilder } from 'objection';

const getPagingArguments = (
  paging: Paging,
): { readonly forward: boolean; readonly offset: number | undefined; readonly limit: number } | undefined => {
  if (isPagingFirst(paging)) {
    return {
      forward: true,
      offset: paging.after === undefined ? undefined : parseInt(paging.after, 10),
      limit: paging.first,
    };
  }

  if (isPagingLast(paging)) {
    return {
      forward: false,
      offset: paging.before === undefined ? undefined : parseInt(paging.before, 10),
      limit: paging.last,
    };
  }

  return undefined;
};

export const applyPagingArguments = async ({
  builder,
  paging,
}: {
  // tslint:disable-next-line no-any
  readonly builder: QueryBuilder<any, any, any>;
  readonly paging: Paging;
  // tslint:disable-next-line no-any
}): Promise<Connection<any>> => {
  const pagingArguments = getPagingArguments(paging);
  let pageInfo;
  if (pagingArguments) {
    const { forward, offset, limit } = pagingArguments;
    if (forward) {
      const newOffset = offset === undefined || isNaN(offset) ? 0 : offset + 1;

      // tslint:disable-next-line no-any
      const pagingForwardResults: any[] = await builder.offset(newOffset).limit(limit + 1);

      const edges = pagingForwardResults.slice(0, limit);

      return {
        edges: edges.map((result, idx) => ({
          cursor: `${newOffset + idx}`,
          node: result,
        })),

        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: pagingForwardResults.length === limit + 1,
          endCursor: `${newOffset + (edges.length - 1)}`,
        },
      };
    }

    const start = offset === undefined ? 0 : offset - limit - 1;
    const actualStart = Math.max(start, 0);
    pageInfo = {
      hasPreviousPage: start > 0,
      hasNextPage: false,
      startCursor: `${actualStart}`,
    };

    // tslint:disable-next-line no-any
    const pagingResults: any[] = await builder.offset(actualStart).limit(actualStart + limit);

    return {
      edges: pagingResults.map((result, idx) => ({
        cursor: `${actualStart + idx}`,
        node: result,
      })),

      pageInfo,
    };
  }

  // tslint:disable-next-line no-any
  const results: any[] = await builder;

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
