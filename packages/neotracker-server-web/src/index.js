/* @flow */
import createServer$ from './createServer$';

export { getRootLoader, getNonce, getUserAgent } from './middleware';

export default createServer$;

export type {
  Environment as ServerEnvironment,
  Options as ServerOptions,
} from './createServer$';
