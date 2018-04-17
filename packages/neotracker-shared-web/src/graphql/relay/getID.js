/* @flow */
export default (id: string) =>
  id
    .split(':')
    .slice(1)
    .join(':');
