import * as appRootDir from 'app-root-dir';
import * as path from 'path';

export const resolveRootPath = (value: string) =>
  path.isAbsolute(value) ? value : path.resolve(appRootDir.get(), value);
