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
    expect(butterfly.git).toBeDefined();
  });

  test('Test changed files', async () => {
    const butterfly = await createButterfly({});
    const tmpFilename = 'somethingInCurrentPath';
    await fs.writeFile(tmpFilename, 'content');
    const pattern = new RegExp(tmpFilename);
    const files = await butterfly.git.changedFiles();
    const found = files.filter((file) => file.match(pattern));
    await fs.unlink(tmpFilename);
    expect(found.length).toBe(1);
  });
});
