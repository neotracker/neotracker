// tslint:disable no-any no-null-keyword
export const convertJSON = (value: any): any => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return typeof value === 'number' ? String(value) : value;
};

export const convertJSONBoolean = (value: any): any => {
  if (!value) {
    return false;
  }

  return true;
};
