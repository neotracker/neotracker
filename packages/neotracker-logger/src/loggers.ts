// tslint:disable: match-default-export-name
import pino from 'pino';

const createLogger = (service: string, options: pino.LoggerOptions = {}) =>
  options.browser !== undefined
    ? pino({ ...options, base: { service } })
    : pino(
        { ...options, base: { service } },
        process.env.NODE_ENV === 'production' ? pino.extreme(1) : pino.destination(1),
      );

const browserOptions =
  // tslint:disable-next-line: strict-type-predicates
  typeof window === 'undefined' && typeof origin === 'undefined' ? {} : { browser: { asObject: true } };

export const coreLogger = createLogger('core', browserOptions);
export const serverLogger = createLogger('server', browserOptions);
export const utilsLogger = createLogger('utils', browserOptions);
export const topLevelLogger = createLogger('compiler', browserOptions);

/*
  hacky way to get the web console logs hidden besides errors
  the client/web doesn't seem to inherit the logLevels we set in a .neotrackerrc
  I suspect there is somewhere in the client code we should call setLogLevel
*/
export const clientLogger = createLogger('client', { level: 'error', ...browserOptions });
export const webLogger = createLogger('web', { level: 'error', ...browserOptions });

// tslint:disable-next-line: no-let
let loggers: ReadonlyArray<pino.Logger> = [
  clientLogger,
  coreLogger,
  serverLogger,
  webLogger,
  utilsLogger,
  topLevelLogger,
];
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
