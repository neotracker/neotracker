// tslint:disable no-import-side-effect ordered-imports
import './init';
import { CollectingLogger, DefaultMonitor, Reporter } from '@neo-one/monitor';
import { labels } from '@neotracker/shared-utils';
import TraceKit from 'tracekit';
import { render } from './render';

const start = () => {
  const monitor = DefaultMonitor.create({ service: 'client_web' });
  // tslint:disable-next-line no-any
  const currentWindow = window as any;
  const endpoint = currentWindow.__OPTIONS__.reportURL;
  if (endpoint != undefined) {
    const collectingLogger = new CollectingLogger();
    // tslint:disable-next-line no-unused-expression
    new Reporter({
      logger: collectingLogger,
      timer: currentWindow.__OPTIONS__.reportTimer,
      endpoint,
    });
  }

  TraceKit.report.subscribe((stack, _isWindowError, error) => {
    const firstStack = stack.stack[0] as TraceKit.StackFrame | undefined;
    monitor
      .withData({
        [labels.STACK_MESSAGE]: stack.message,
        [labels.STACK_LINENUMBER]: firstStack === undefined ? undefined : firstStack.line,
        [labels.STACK_COLUMNNUMBER]: firstStack === undefined ? undefined : firstStack.column,
      })
      .logError({ name: 'client_uncaught_exception', error });
  });
  // tslint:disable-next-line no-object-mutation
  TraceKit.collectWindowErrors = true;

  currentWindow.addEventListener('unhandledrejection', (event: PromiseRejectionEvent | undefined) => {
    let error = new Error('Unknown');
    if (event && event.reason instanceof Error) {
      error = event.reason;
    }

    monitor.logError({ name: 'client_unhandled_rejection', error });
    if (event) {
      event.preventDefault();
    }
  });

  render({ monitor });
};

start();
