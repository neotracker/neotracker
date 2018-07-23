import * as fs from 'fs-extra';
import { Check } from '../ButterflyCIHandler';

export interface JestOptions {
  readonly name: string;
  readonly config: string;
}
export const jest = ({ name, config }: JestOptions): Check => ({
  name,
  run: async (butterfly) => {
    const resultFile = await butterfly.tmp.fileName();
    await butterfly.exec('jest', [
      '-c',
      config,
      '-w',
      '2',
      '--outputFile',
      resultFile,
      '--json',
      '--no-colors',
      '--ci',
      '--passWithNoTests',
    ]);
    const resultsContent = await fs.readFile(resultFile, 'utf8');
    const results = JSON.parse(resultsContent);

    if (results.success) {
      return {
        title: 'Test Results',
        summary: 'Passed :+1:',
        conclusion: 'success',
      };
    }

    return {
      title: 'Test Results',
      summary: 'Failed!',
      conclusion: 'failure',
    };
  },
});
