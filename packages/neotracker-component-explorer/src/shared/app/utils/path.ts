const splitPath = (filePath: string): ReadonlyArray<string> => filePath.split('/');
// tslint:disable-next-line readonly-array
export const join = (...parts: string[]): string => parts.join('/');

export const basename = (filePath: string, ext?: string) => {
  const parts = splitPath(filePath);
  const fileName = parts[parts.length - 1];

  if (ext === undefined) {
    return fileName;
  }

  return fileName.endsWith(ext) ? fileName.slice(0, -ext.length) : fileName;
};

export const dirname = (filePath: string) => {
  const parts = splitPath(filePath);

  return join(...parts.slice(0, -1));
};
