// tslint:disable-next-line no-any
export const convertJSON = (value: any): any => {
  if (value === undefined) {
    return undefined;
  }

  // tslint:disable-next-line no-null-keyword
  if (value === null) {
    // tslint:disable-next-line no-null-keyword
    return null;
  }

  return typeof value === 'number' ? String(value) : value;
};
