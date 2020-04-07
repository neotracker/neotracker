import { NetworkType } from '@neo-one/client-common';
import { AppOptions, utils } from '@neotracker/shared-utils';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetData } from 'react-helmet';
import serializeJavascript from 'serialize-javascript';

function stylesheetTag(stylesheetFilePath: string) {
  return (
    <link
      key={stylesheetFilePath}
      href={stylesheetFilePath}
      media="screen, projection"
      rel="stylesheet"
      type="text/css"
    />
  );
}

// tslint:disable-next-line no-any
export type AddHeadElements = (nonce: string) => ReadonlyArray<React.ReactElement>;
// tslint:disable-next-line no-any
export type AddBodyElements = () => ReadonlyArray<React.ReactElement>;

interface Props {
  readonly css: ReadonlyArray<string>;
  readonly js: ReadonlyArray<string>;
  readonly helmet: HelmetData;
  readonly nonce: string;
  readonly googleAnalyticsTag: string;
  readonly reactAppString: string;
  readonly apolloState: NormalizedCacheObject;
  readonly styles: ReadonlyArray<React.ReactElement<{}>>;
  readonly userAgent: IUAParser.IResult;
  readonly network: NetworkType;
  readonly appOptions: AppOptions;
  readonly appVersion: string;
  readonly addHeadElements: AddHeadElements;
  readonly addBodyElements: AddBodyElements;
  readonly adsenseID?: string;
  readonly bsaEnabled?: boolean;
}

export const makeServerHTML = ({
  css,
  js,
  helmet,
  nonce,
  googleAnalyticsTag,
  reactAppString,
  apolloState,
  styles,
  userAgent,
  appOptions,
  network,
  appVersion,
  addHeadElements,
  addBodyElements,
  adsenseID,
  bsaEnabled,
}: Props) => {
  // Creates an inline script definition that is protected by the nonce.
  const inlineScript = (body: string, key?: string) => (
    <script key={key} nonce={nonce} type="text/javascript" dangerouslySetInnerHTML={{ __html: body }} />
  );

  // Make sure scripts are added to the Content Security Policy
  const scriptTag = (src: string, scriptProps: object = {}) => (
    <script {...scriptProps} nonce={nonce} type="text/javascript" src={src} />
  );

  const headerElements = [
    ...css.map(stylesheetTag),
    inlineScript(
      `
      (function(d) {
        var o = d.createElement;
        d.createElement = function() {
          var e = o.apply(d, arguments);
          if (e.tagName === 'SCRIPT') {
            e.setAttribute('nonce', '${nonce}');
          }
          return e;
        }
      })(document);
    `,
      'nonce-script',
    ),
    ...addHeadElements(nonce),
    // tslint:disable no-any
    ...(helmet.base.toComponent() as any),
    ...(helmet.link.toComponent() as any),
    ...(helmet.meta.toComponent() as any),
    ...(helmet.noscript.toComponent() as any),
    ...(helmet.script.toComponent() as any),
    ...(helmet.style.toComponent() as any),
    // tslint:enable no-any
    adsenseID === undefined
      ? undefined
      : scriptTag('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          async: true,
          key: 'adsense-tag',
        }),
    adsenseID === undefined
      ? undefined
      : inlineScript(
          `
      (adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "${adsenseID}",
        enable_page_level_ads: true
      });
    `,
          'adsense',
        ),
    googleAnalyticsTag === ''
      ? undefined
      : scriptTag(`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsTag}`, { async: true }),
    googleAnalyticsTag === ''
      ? undefined
      : inlineScript(`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config','${googleAnalyticsTag}');
    `),
  ]
    .filter(utils.notNull)
    .concat(styles);

  const constructScript = () => {
    let script = '';
    script += `window.__APOLLO_STATE__=${serializeJavascript(apolloState)};`;
    script += `window.__OPTIONS__=${serializeJavascript(appOptions)};`;
    script += `window.__USER_AGENT__=${serializeJavascript(userAgent)};`;
    script += `window.__CSS__=${serializeJavascript(css)};`;
    script += `window.__NONCE__=${serializeJavascript(nonce)};`;
    script += `window.__NETWORK__=${serializeJavascript(network)};`;
    script += `window.__APP_VERSION__=${serializeJavascript(appVersion)};`;

    return inlineScript(script);
  };

  let bsaElement;
  if (bsaEnabled) {
    bsaElement = inlineScript(`
    (function(){
      var bsa = document.createElement('script');
        bsa.type = 'text/javascript';
        bsa.async = true;
        bsa.src = '//s3.buysellads.com/ac/bsa.js';
      (document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(bsa);
    })();
    `);
  }

  // tslint:disable no-unnecessary-callback-wrapper
  return renderToStaticMarkup(
    <html {...helmet.htmlAttributes.toComponent()}>
      <head>{headerElements}</head>
      <body {...helmet.bodyAttributes.toComponent()}>
        {bsaElement}
        <div id="app" dangerouslySetInnerHTML={{ __html: reactAppString }} />
        {constructScript()}
        {js.map((value) => scriptTag(value, { key: value }))}
        {helmet.script.toComponent()}
        {addBodyElements()}
      </body>
    </html>,
  );
  // tslint:enable no-unnecessary-callback-wrapper
};
