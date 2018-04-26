/* @flow */
import createServer$ from './createServer$';

export {
  getRootLoader,
  getMonitor,
  getNonce,
  getUserAgent,
  simpleMiddleware,
} from './middleware';

export default createServer$;

export type {
  Environment as ServerEnvironment,
  Options as ServerOptions,
} from './createServer$';
export type { ServerMiddleware } from './middleware';
