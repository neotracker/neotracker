// tslint:disable-next-line match-default-export-name
import glob from 'glob';
import * as path from 'path';

export const getGlobFiles = async ({
  rootDir,
  componentsDir,
  ext,
}: {
  readonly rootDir: string;
  readonly componentsDir: string;
  readonly ext: string;
}): Promise<ReadonlyArray<string>> =>
  new Promise<ReadonlyArray<string>>((resolve, reject) =>
    glob(path.resolve(rootDir, componentsDir, '**', `*.${ext}`), (error, matches) => {
      if (error) {
        reject(error);
      } else {
        resolve(matches.map((file) => path.resolve(rootDir, file)));
      }
    }),
  );
