/* @flow */
export default (colName: string) => {
  const parts = colName.split('.');
  if (parts.length === 1) {
    return null;
  }
  return parts[0];
};
