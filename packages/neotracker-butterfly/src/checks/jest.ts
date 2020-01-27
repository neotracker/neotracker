import * as fs from 'fs-extra';
import * as path from 'path';
import { Check, CheckAnnotation, CheckResult } from '../ButterflyCIHandler';

export interface JestOptions {
  readonly name: string;
  readonly config: string;
  readonly workers?: number;
}

interface JestData {
  readonly numFailedTestSuites: number;
  readonly numFailedTests: number;
  readonly numPassedTestSuites: number;
  readonly numPassedTests: number;
  readonly numPendingTestSuites: number;
  readonly numPendingTests: number;
  readonly numRuntimeErrorTestSuites: number;
  readonly numTotalTestSuites: number;
  readonly numTotalTests: number;
  readonly wasInterrupted: boolean;
  readonly startTime: number;
  readonly success: boolean;
  readonly snapshot: JestSnapshot;
  readonly testResults: ReadonlyArray<JestResultSet>;
}
interface JestTestResult {
  readonly ancestorTitles: ReadonlyArray<string>;
  readonly failureMessages: ReadonlyArray<string>;
  readonly fullName: string;
  readonly location?: string;
  readonly status: 'failed' | 'passed' | 'skipped';
  readonly title: string;
}

interface JestResultSet {
  readonly assertionResults: ReadonlyArray<JestTestResult>;
  readonly message: string;
  readonly name: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly status: 'failed' | 'passed';
  readonly summary: string;
}
interface JestSnapshotUncheckedFile {
  readonly filePath: ReadonlyArray<string>;
  readonly keys: ReadonlyArray<string>;
}
interface JestSnapshot {
  readonly didUpdate: false;
  readonly failure: true;
  readonly added: number;
  readonly filesAdded: number;
  readonly filesRemoved: number;
  readonly filesUnmatched: number;
  readonly filesUpdated: number;
  readonly matched: number;
  readonly total: number;
  readonly unchecked: number;
  readonly unmatched: number;
  readonly updated: number;
  readonly uncheckedKeysByFile: ReadonlyArray<JestSnapshotUncheckedFile>;
}

const resultWithFailures = (result: JestData) => !result.success && result.testResults.length > 0;

export const jest = ({ name, config, workers = 2 }: JestOptions): Check => ({
  name,
  run: async (butterfly): Promise<CheckResult> => {
    const resultFile = await butterfly.tmp.fileName();
    await butterfly.exec('jest', [
      '-c',
      config,
      '-w',
      workers.toString(),
      '--outputFile',
      resultFile,
      '--json',
      '--no-colors',
      '--ci',
      '--passWithNoTests',
    ]);
    const resultsContent = await fs.readFile(resultFile, 'utf8');

    const { annotations, summary, results } = parseJestResults(resultsContent);

    if (results.success) {
      return {
        title: `Test Results`,
        summary: `Passed :+1:\n${summary}`,
        conclusion: 'success',
      };
    }

    return {
      title: `Test Results`,
      summary,
      annotations,
      conclusion: 'failure',
    };
  },
});

export const parseJestResults = (data: string) => {
  const results: JestData = JSON.parse(data);

  if (!results.success && !resultWithFailures(results)) {
    const stringResults = JSON.stringify(results);
    throw new Error(`Jest Object format not recognized \n\n${stringResults} \n\n`);
  }

  const errorSummary = summarizeAnnotationsWoLineNums(results);
  const annotations = resultWithFailures(results) ? formatFailingAnnotations(results) : [];

  return {
    annotations,
    summary: `

${runSummary(results)}
${groupedResults(results.testResults)}
${errorSummary}
  `,
    results,
  };
};

const runSummary = (data: JestData): string => `
${testStatsSummary('Test Suites . .', data.numFailedTestSuites, data.numPassedTestSuites, data.numTotalTestSuites)}
${testStatsSummary('Tests. . . . . . .', data.numFailedTests, data.numPassedTests, data.numTotalTests)}
${snapshotStatsSummary(data.snapshot)}
  `;

const testStatsSummary = (title: string, fail: number, pass: number, total: number): string => {
  const skipped = total - (fail + pass);
  const stats = [
    fail ? `:exclamation: ${fail} failed` : '',
    skipped ? `:question: ${skipped} skipped` : '',
    pass ? `:white_check_mark: ${pass} passed` : '',
    `${total} total`,
  ]
    .filter((value: string) => value.length > 0)
    .join(', ');

  return `${title} ${stats}`;
};

const snapshotStatsSummary = (ssd: JestSnapshot): string => {
  const stats = [
    ssd.added ? `${ssd.added} added` : '',
    ssd.filesAdded ? `${ssd.filesAdded} files added` : '',
    ssd.filesRemoved ? `${ssd.filesRemoved} files removed` : '',
    ssd.filesUnmatched ? `:exclamation: ${ssd.filesUnmatched} failed` : '',
    ssd.filesUpdated ? `${ssd.filesUpdated} files updated` : '',
    ssd.matched ? `:white_check_mark: ${ssd.matched} passed` : '',
    ssd.unchecked ? `:question: ${ssd.unchecked} unchecked` : '',
    ssd.updated ? `${ssd.updated} updated` : '',
    `${ssd.total} total`,
  ]
    .filter((value: string) => value.length > 0)
    .join(', ');

  return `Snapshot . . . ${stats}`;
};

const groupedResults = (allResults: ReadonlyArray<JestResultSet>): string =>
  allResults
    .filter((group) => group.status === 'failed')
    .map(
      (group: JestResultSet): string =>
        `
## ${getPassFailBlock(group.status)}&nbsp;&nbsp; ${path.basename(group.name)}
Time: ${getElapsed(group.startTime, group.endTime)}
${formatTestResults(group.assertionResults)}
${optionalGroupMessage(group.message)}
    `,
    )
    .join('\n');

const formatTestResults = (groupResults: ReadonlyArray<JestTestResult>): string => {
  const failed = groupResults.filter((jta: JestTestResult) => jta.status === 'failed').map(formatTestResult);

  return failed.join('\n');
};
const optionalGroupMessage = (msg: string): string =>
  !msg
    ? ''
    : `### Summary of all failing tests
${msg}`;

const formatTestResult = (result: JestTestResult): string => `${getPassFailIcon(result.status)} ${result.title}`;

const getPassFailIcon = (status: string): string => `${status === 'passed' ? ':white_check_mark:' : ':exclamation:'}`;

const getPassFailBlock = (status: string): string => (status === 'failed' ? ':bangbang: ' : ':star: ');

const getElapsed = (start: number, end: number): string => {
  const totalSeconds = (end - start) / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const totalSeconds2 = totalSeconds % 3600;
  const minutes = Math.floor(totalSeconds2 / 60);
  const seconds = parseInt(`${totalSeconds2 % 60}`, 10);

  return [hours ? `${hours} h` : '', minutes ? `${minutes} m` : '', seconds ? `${seconds} s` : ''].join(' ');
};

const summarizeAnnotationsWoLineNums = (results: JestData): string => {
  const failingWoLineNumber = results.testResults.filter(
    (resultGroup: JestResultSet) =>
      resultGroup.status === 'failed' &&
      resultGroup.assertionResults.filter(
        (assertion) =>
          assertion.status === 'failed' &&
          (assertion.failureMessages.length === 0 || errLineNum(assertion.failureMessages.join()) === 0),
      ).length > 0,
  );

  if (failingWoLineNumber.length === 0) {
    return '';
  }

  const formattedFails = failingWoLineNumber
    .map((resultGroup: JestResultSet): string =>
      resultGroup.assertionResults
        .map((ta) => {
          if (ta.failureMessages.length === 0) {
            return JSON.stringify(ta);
          }

          return ta.failureMessages.join('\n');
        })
        .join('\n\n'),
    )
    .join('---- \n\n\n');

  return `Special Attention: \n${formattedFails}`;
};

const formatFailingAnnotations = (results: JestData): ReadonlyArray<CheckAnnotation> => {
  if (!resultWithFailures(results)) {
    return [];
  }
  const failing = results.testResults.filter(
    (resultGroup: JestResultSet) =>
      resultGroup.status === 'failed' &&
      resultGroup.assertionResults.filter(
        (assertion) => assertion.failureMessages.length > 0 && errLineNum(assertion.failureMessages.join()) > 0,
      ).length > 0,
  );

  return failing
    .map(
      (resultGroup: JestResultSet): ReadonlyArray<CheckAnnotation> => {
        const relativeFilePath = path.relative(process.cwd(), resultGroup.name);
        const failedAssertions = resultGroup.assertionResults.filter((testResult) => testResult.status === 'failed');

        return fileToFailString(relativeFilePath, failedAssertions);
      },
    )
    .reduce((leftSide, rightSide) => leftSide.concat(rightSide), []);
};

const errLineNum = (message: string): number => {
  const parts = message.match(/([0-9]+):[0-9]+\)/);

  if (parts !== null && parts.length > 0) {
    return parseInt(parts[1], 10);
  }

  return 0;
};
const assertionFailString = (file: string, status: JestTestResult): CheckAnnotation => {
  const failureMessages = status.failureMessages.join('\n');
  const title = failureMessages.match(/(New snapshot was not written)|(does not match stored snapshot)/)
    ? 'Snapshot has changed'
    : status.title;

  const errOnLine = errLineNum(failureMessages);

  return {
    warningLevel: 'failure',
    fileName: file,
    title,
    startLine: errOnLine,
    endLine: errOnLine,
    message: `${failureMessages}`,
  };
};
const fileToFailString = (
  fpath: string,
  failedAssertions: ReadonlyArray<JestTestResult>,
): ReadonlyArray<CheckAnnotation> =>
  failedAssertions.map((testResult: JestTestResult) => assertionFailString(fpath, testResult));
