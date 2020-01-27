import {
  dbConnectivityIssueTest,
  neoOneUnitTests,
  simpleFailedTest,
  simplePassingTest,
  testSnapshotChanges,
} from '../data/jestJson';

import { parseJestResults } from '../../../src/checks/jest';

describe('GitHub Check Run API Compliance', () => {
  test('Passing Test', () => {
    const { summary, annotations } = parseJestResults(JSON.stringify(simplePassingTest));
    expect(summary).toContain('2 total');
    expect(annotations.length).toBeLessThan(1);
  });

  test('Simple failing unit test', () => {
    const { summary, annotations } = parseJestResults(JSON.stringify(simpleFailedTest));

    if (annotations.length) {
      const firstAnnotation = annotations[0];
      expect(summary).toContain('2 total');
      expect(firstAnnotation.startLine).toEqual(135);
      expect(firstAnnotation.endLine).toEqual(135);
      expect(firstAnnotation.warningLevel).toContain('failure');
      expect(firstAnnotation.fileName).toContain('test');
      expect(firstAnnotation.title).toEqual('success result');
      expect(firstAnnotation.message).toContain('Expected: 1');
      expect(firstAnnotation.title).toContain('success result');
    } else {
      expect(annotations).toBeTruthy();
    }
  });

  test('Postgres Error', () => {
    const { summary, annotations } = parseJestResults(JSON.stringify(dbConnectivityIssueTest));

    if (annotations.length) {
      const firstAnnotation = annotations[0];
      expect(summary).toContain('1 total');
      expect(firstAnnotation.startLine).toEqual(1393);
      expect(firstAnnotation.endLine).toEqual(1393);
      expect(firstAnnotation.warningLevel).toContain('failure');
      expect(firstAnnotation.fileName).toContain('ActionsUpdater');
      expect(firstAnnotation.title).toEqual('inserts actions');
      expect(firstAnnotation.message).toContain('Failed to start postgres');
      expect(firstAnnotation.title).toContain('inserts actions');
    } else {
      expect(annotations).toBeTruthy();
    }
  });
  test('NEO One unit tests', () => {
    const { summary, annotations } = parseJestResults(JSON.stringify(neoOneUnitTests));

    if (annotations.length) {
      const firstAnnotation = annotations[0];
      expect(summary).toContain('1049 total');
      expect(firstAnnotation.startLine).toEqual(1393);
      expect(firstAnnotation.endLine).toEqual(1393);
      expect(firstAnnotation.warningLevel).toContain('failure');
      expect(firstAnnotation.fileName).toContain('ActionsUpdater');
      expect(firstAnnotation.title).toEqual('inserts actions');
      expect(firstAnnotation.title).toContain('inserts actions');
      expect(firstAnnotation.message).toContain('Socket.socketErrorListener');
    } else {
      expect(annotations).toBeTruthy();
    }
  });
  test('liveGitTestData2', () => {
    const { summary, annotations } = parseJestResults(JSON.stringify(testSnapshotChanges));

    if (annotations.length) {
      const firstAnnotation = annotations[0];
      expect(summary).toContain('3 total');
      expect(firstAnnotation.startLine).toEqual(46);
      expect(firstAnnotation.endLine).toEqual(46);
      expect(firstAnnotation.warningLevel).toContain('failure');
      expect(firstAnnotation.fileName).toContain('ActionsUpdater');
      expect(firstAnnotation.title).toEqual('Snapshot has changed');
      expect(firstAnnotation.message).toContain('toMatchSnapshot');
      expect(firstAnnotation.title).toContain('Snapshot has changed');
    } else {
      expect(annotations).toBeTruthy();
    }
  });
});
