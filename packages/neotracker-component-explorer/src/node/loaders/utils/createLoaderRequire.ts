import { Require } from '../types';
import { createRequire } from './createRequire';

export const createLoaderRequire = ({
  loaderPath,
  filePath,
}: {
  readonly loaderPath: string;
  readonly filePath: string;
}): Require => createRequire(`!!${loaderPath}!${filePath}`);
