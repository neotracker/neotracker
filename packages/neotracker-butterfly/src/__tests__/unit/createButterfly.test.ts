// wallaby: file.skip
import * as fs from 'fs-extra';
import { createButterfly } from '../../createButterfly';

export interface CircleCIOptions {
  readonly token: string;
}
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

  test('Test changed files', async () => {
    const tmpFilename = 'somethingInCurrentPath';
    await fs.writeFile(tmpFilename, 'content');
    const butterfly = await createButterfly({});
    const files = await butterfly.git.getChangedFiles();
    const pattern = new RegExp(tmpFilename);
    const found = files.filter((file) => file.match(pattern));
    await fs.unlink(tmpFilename);
    expect(found.length).toBe(1);
  });
});
