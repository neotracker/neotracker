/* @flow */
// $FlowFixMe
import { tryParseInt } from '@neotracker/shared-utils';

export const PAGE_SIZE = 20;

export const getPage = (match: any) =>
  match.params.page == null
    ? 1
    : tryParseInt({
        value: match.params.page,
        default: 1,
      });

export const mapPropsToVariables = (pageSize: number) => ({
  match,
}: Object) => {
  const page = getPage(match);
  return {
    first: pageSize,
    after: page === 1 ? null : ((page - 1) * pageSize - 1).toString(),
  };
};
