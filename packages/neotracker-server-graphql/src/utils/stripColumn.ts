export const stripColumn = (colName: string) => {
  const parts = colName.split('.');
  if (parts.length === 1) {
    return undefined;
  }

  return parts[0];
};
