/* @flow */

export default (arr: number[]) =>
  arr.reduce((sum, current) => sum + current, 0) / arr.length;
