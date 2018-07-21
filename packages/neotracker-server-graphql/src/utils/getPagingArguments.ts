import { Paging } from '@neotracker/shared-graphql';

export const getPagingArguments = ({
  first,
  after,
  last,
  before,
}: {
  readonly first?: number;
  readonly after?: string;
  readonly last?: number;
  readonly before?: string;
}): Paging => {
  if (first !== undefined) {
    return { first, after };
  }

  if (last !== undefined && before !== undefined) {
    return { last, before };
  }

  return {};
};
