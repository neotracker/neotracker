// wallaby: file.skip
import * as appRootDir from 'app-root-dir';
import * as fs from 'fs-extra';
import * as path from 'path';
import { createButterfly } from '../../createButterfly';

export interface CircleCIOptions {
  readonly token: string;
}

const packagesPath = path.resolve(appRootDir.get(), 'packages');

describe('Test the Git implementation', () => {
  test('Test changed files', async () => {
    const butterfly = await createButterfly({});
    expect(butterfly.tmp).toBeDefined();
    expect(butterfly.exec).toBeDefined();
    expect(butterfly.util).toBeDefined();
    expect(butterfly.git).toBeDefined();
  });

  test('get file list', async () => {
    const butterfly = await createButterfly({});
    const files = await butterfly.util.getFiles();
    expect(files.length).toBeGreaterThan(3);
  });

  test('get file list, limit to 1 folder + subfolders', async () => {
    const butterfly = await createButterfly({});
    const files = await butterfly.util.getFiles(packagesPath);
    expect(files.length).toBeGreaterThan(3);
  });

  test('get file list, limit to a single folder', async () => {
    const butterfly = await createButterfly({});
    const files = await butterfly.util.getFiles(packagesPath, 1);
    expect(files.length).toBeGreaterThan(3);
  });

  test('get file list > specific folder > 1 folder', async () => {
    const butterfly = await createButterfly({});
    const [allFiles, packageFolder, packages] = await Promise.all([
      butterfly.util.getFiles(),
      butterfly.util.getFiles(packagesPath),
      butterfly.util.getFiles(packagesPath, 1),
    ]);
    expect(packageFolder.length).toBeLessThan(allFiles.length);
    expect(packages.length).toBeLessThan(packageFolder.length);
  });

  test('Test changed files', async () => {
    const tmpFilename = 'somethingInCurrentPath';
    const [butterfly] = await Promise.all([createButterfly({}), fs.writeFile(tmpFilename, 'content')]);
    const files = await butterfly.git.getChangedFiles();
    const pattern = new RegExp(tmpFilename);
    const found = files.filter((file) => file.match(pattern));
    await fs.unlink(tmpFilename);
    expect(found.length).toBe(1);
  });
});
