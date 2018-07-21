import * as fs from 'fs';

const double = /\/\//;
export function toUnix(fileName: string): string {
  let res = fileName.replace(/\\/g, '/');
  // tslint:disable-next-line no-loop-statement
  while (res.match(double)) {
    res = res.replace(double, '/');
  }

  return res;
}

// tslint:disable-next-line no-let
let caseInsensitiveFs: boolean | undefined;
export const isCaseInsensitive = () => {
  if (caseInsensitiveFs !== undefined) {
    return caseInsensitiveFs;
  }

  const lowerCaseStat = statSyncNoException(process.execPath.toLowerCase());
  const upperCaseStat = statSyncNoException(process.execPath.toUpperCase());

  caseInsensitiveFs =
    lowerCaseStat &&
    upperCaseStat &&
    lowerCaseStat.dev === upperCaseStat.dev &&
    lowerCaseStat.ino === upperCaseStat.ino;

  return caseInsensitiveFs;
};

function statSyncNoException(filePath: string): fs.Stats | undefined {
  try {
    return fs.statSync(filePath);
  } catch {
    return undefined;
  }
}
