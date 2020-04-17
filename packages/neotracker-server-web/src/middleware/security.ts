import { simpleMiddleware } from '@neotracker/server-utils-koa';
import { utils } from '@neotracker/shared-utils';
import compose from 'koa-compose';
import * as koaHelmet from 'koa-helmet';
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
    readonly directives: { [K in string]?: any[] | boolean };
    readonly browserSniff: boolean;
  };
  readonly featurePolicy: {
    readonly enabled: boolean;
    // tslint:disable-next-line no-any readonly-array
    readonly features: { [K in string]?: any[] };
  };
  readonly expectCt: {
    readonly enabled: boolean;
    readonly config: {
      readonly enforce: boolean;
      readonly maxAge: number;
      readonly reportUri: string;
    };
  };
}

// tslint:disable-next-line no-any readonly-array
const addNonce = (directives: { [K in string]?: any[] | boolean }, key: string): void => {
  let directive = directives[key];
  if (typeof directive === 'boolean') {
    return;
  }
  // tslint:disable-next-line no-object-mutation
  directives[key] = directive = directive === undefined ? [] : [...directive];

  // tslint:disable-next-line no-array-mutation no-any
  directive.unshift((req: any) => `'nonce-${req.nonce}'`);
};

export const security = ({ options }: { readonly options: Options }) => {
  const { cspConfig } = options;
  const featurePolicyConfig = {
    features: options.featurePolicy.features,
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
          // Must be at least 1 year to be approved by Google
          maxAge: 31536000,
          // Must be enabled to be approved by Google
          includeSubDomains: true,
          preload: true,
        }),
        koaHelmet.ieNoOpen(),
        koaHelmet.noSniff(),
        koaHelmet.xssFilter(),
        // tslint:disable-next-line no-any
        (koaHelmet as any).permittedCrossDomainPolicies(),
        koaHelmet.referrerPolicy(),
        koaHelmet.dnsPrefetchControl({ allow: false }),
        // tslint:disable-next-line no-any
        options.featurePolicy.enabled ? (koaHelmet as any).featurePolicy(featurePolicyConfig) : undefined,
        options.expectCt.enabled
          ? // tslint:disable-next-line: no-any
            (koaHelmet as any).expectCt(options.expectCt.config)
          : undefined,
      ].filter(utils.notNull),
    ),
  );
};
