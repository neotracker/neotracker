// tslint:disable: match-default-export-name
import pino from 'pino';
import { getPretty } from './pretty';

const createLogger = (service: string, options: pino.LoggerOptions = {}) =>
  options.browser !== undefined
    ? pino({ ...options, base: { service }, prettyPrint: getPretty() })
    : pino(
        { ...options, base: { service }, prettyPrint: getPretty() },
        process.env.NODE_ENV === 'production' ? pino.extreme(1) : pino.destination(1),
      );

const browserOptions =
  // tslint:disable-next-line: strict-type-predicates
  typeof window === 'undefined' && typeof origin === 'undefined' ? {} : { browser: { asObject: true } };

export const clientLogger = createLogger('client', browserOptions);
export const coreLogger = createLogger('core', browserOptions);
export const serverLogger = createLogger('server', browserOptions);
export const webLogger = createLogger('web', browserOptions);
export const utilsLogger = createLogger('utils', browserOptions);

// tslint:disable-next-line: no-let
let loggers: ReadonlyArray<pino.Logger> = [clientLogger, coreLogger, serverLogger, webLogger, utilsLogger];
export const setGlobalLogLevel = (level: pino.LevelWithSilent) =>
  loggers.forEach((logger) => {
    // tslint:disable-next-line no-object-mutation
    logger.level = level;
  });

export const getFinalLogger = (logger: pino.Logger) => pino.final(logger);

export const createChild = (
  parent: pino.Logger,
  bindings: {
    readonly level?: pino.LevelWithSilent | string;
    // tslint:disable-next-line: no-any
    readonly [key: string]: any;
  },
) => {
  const child = parent.child(bindings);
  loggers = loggers.concat(child);

  return child;
};
