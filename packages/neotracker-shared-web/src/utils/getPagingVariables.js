/* @flow */
export default (pageSize: number, page: number, offset: number = 0) => ({
  first: page === 1 ? pageSize - offset : pageSize,
  after: page === 1 ? null : ((page - 1) * pageSize - (offset + 1)).toString(),
});
