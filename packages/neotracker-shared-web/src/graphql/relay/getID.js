/* @flow */
export const getID = (id: string) =>
  id
    .split(':')
    .slice(1)
    .join(':');

export const getNumericID = (id: string) => parseInt(getID(id), 10);
