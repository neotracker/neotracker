import { clientLogger } from '@neotracker/logger';
import { labels } from '@neotracker/shared-utils';
import debug from 'debug';
import TraceKit from 'tracekit';
// tslint:disable-next-line no-import-side-effect
import './init';
import { render } from './render';

const logger = debug('NEOTRACKER:ClientWeb');

const start = () => {
  // tslint:disable-next-line no-any
  const currentWindow = window as any;
  TraceKit.report.subscribe((stack, _isWindowError, error) => {
    const firstStack = stack.stack[0] as TraceKit.StackFrame | undefined;
    const logInfo = {
      title: 'client_uncaught_exception',
      error: error.message,
      [labels.STACK_MESSAGE]: stack.message,
      [labels.STACK_LINENUMBER]: firstStack === undefined ? undefined : firstStack.line,
      [labels.STACK_COLUMNNUMBER]: firstStack === undefined ? undefined : firstStack.column,
    };
    clientLogger.error({ ...logInfo });
    logger('%o', { level: 'error', ...logInfo });
  });
  // tslint:disable-next-line no-object-mutation
  TraceKit.collectWindowErrors = true;

  currentWindow.addEventListener('unhandledrejection', (event: PromiseRejectionEvent | undefined) => {
    let error = new Error('Unknown');
    if (event && event.reason instanceof Error) {
      error = event.reason;
    }

    const logInfo = { title: 'client_unhandled_rejection', error: error.message };
    clientLogger.error({ ...logInfo }, 'unhandled rejection at start');
    logger('%o', { level: 'error', ...logInfo });
    if (event) {
      event.preventDefault();
    }
  });

  render();
};

start();
