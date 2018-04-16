/* @flow */
import type { Paging } from 'neotracker-shared-graphql';

export default ({
  first,
  after,
  last,
  before,
}: {
  first?: number,
  after?: string,
  last?: number,
  before?: string,
}): Paging => {
  if (first != null) {
    return { first, after };
  } else if (last != null && before != null) {
    return { last, before };
  }

  return {};
};
