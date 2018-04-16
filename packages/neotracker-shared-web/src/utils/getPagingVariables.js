/* @flow */
export default (pageSize: number, page: number) => ({
  first: pageSize,
  after: page === 1 ? null : ((page - 1) * pageSize - 1).toString(),
});
