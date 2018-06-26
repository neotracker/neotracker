import compose from 'koa-compose';
import * as koaHelmet from 'koa-helmet';
import { simpleMiddleware } from 'neotracker-server-utils-koa';
import { utils } from 'neotracker-shared-utils';
import { enforceHTTPS } from './enforceHttps';

export interface Options {
  readonly enforceHTTPs: boolean;
  readonly frameguard: {
    readonly enabled: boolean;
    readonly action: string;
  };
  readonly cspConfig: {
    readonly enabled: boolean;
    // tslint:disable-next-line no-any readonly-array
    readonly directives: { [K in string]?: any[] };
    readonly browserSniff: boolean;
  };
}

// tslint:disable-next-line no-any readonly-array
const addNonce = (directives: { [K in string]?: any[] }, key: string): void => {
  let directive = directives[key];
  // tslint:disable-next-line no-object-mutation
  directives[key] = directive = directive === undefined ? [] : [...directive];

  // tslint:disable-next-line no-array-mutation no-any
  directive.unshift((req: any) => `'nonce-${req.nonce}'`);
};

export const security = ({ options }: { readonly options: Options }) => {
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
          ? enforceHTTPS({
              trustProtoHeader: true,
            })
          : undefined,
        options.cspConfig.enabled ? koaHelmet.contentSecurityPolicy(cspConfig) : undefined,
        options.frameguard.enabled ? koaHelmet.frameguard({ action: options.frameguard.action }) : undefined,
        // tslint:disable-next-line no-any
        (koaHelmet as any).hidePoweredBy(),
        koaHelmet.hsts({
          // Must be at least 18 weeks to be approved by Google
          maxAge: 10886400,
          // Must be enabled to be approved by Google
          includeSubdomains: true,
          preload: true,
        }),

        koaHelmet.ieNoOpen(),
        koaHelmet.noSniff(),
        koaHelmet.xssFilter(),
      ].filter(utils.notNull),
    ),
  );
};
