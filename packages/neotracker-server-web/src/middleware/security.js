/* @flow */
import compose from 'koa-compose';
import helmet from 'koa-helmet';

import enforceHttps from './enforceHttps';
import { simpleMiddleware } from './common';

export type Options = {|
  enforceHTTPs: boolean,
  frameguard: {|
    enabled: boolean,
    action: string,
  |},
  cspConfig: {|
    enabled: boolean,
    directives: { [key: string]: Array<mixed> },
    browserSniff: boolean,
  |},
|};

const addNonce = (
  directives: { [key: string]: Array<mixed> },
  key: string,
): void => {
  if (directives[key] == null) {
    // eslint-disable-next-line
    directives[key] = [];
  } else {
    // eslint-disable-next-line
    directives[key] = [...directives[key]];
  }

  directives[key].unshift((req: Object) => `'nonce-${req.nonce}'`);
};

// TODO: Should we add helmet.hpkp?
export default ({ options }: {| options: Options |}) => {
  const cspConfig = {
    ...options.cspConfig,
    directives: {
      ...options.cspConfig.directives,
    },
  };
  addNonce(cspConfig.directives, 'scriptSrc');
  addNonce(cspConfig.directives, 'childSrc');

  return simpleMiddleware(
    'security',
    compose(
      [
        options.enforceHTTPs
          ? enforceHttps({
              trustProtoHeader: true,
            })
          : null,
        options.cspConfig.enabled
          ? helmet.contentSecurityPolicy(cspConfig)
          : null,
        options.frameguard.enabled
          ? helmet.frameguard({ action: options.frameguard.action })
          : null,
        helmet.hidePoweredBy(),
        helmet.hsts({
          // Must be at least 18 weeks to be approved by Google
          maxAge: 10886400,
          // Must be enabled to be approved by Google
          includeSubDomains: true,
          preload: true,
        }),
        helmet.ieNoOpen(),
        helmet.noSniff(),
        helmet.xssFilter(),
      ].filter(Boolean),
    ),
  );
};
