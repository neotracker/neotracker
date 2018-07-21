import { NetworkType } from '@neo-one/client';
import { utils } from 'neotracker-shared-utils';
// @ts-ignore
import { AppOptions } from 'neotracker-shared-web';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetData } from 'react-helmet';
import serializeJavascript from 'serialize-javascript';
import { AddBodyElements, AddHeadElements } from '../reactApp';

function stylesheetTag(stylesheetFilePath: string) {
  return <link href={stylesheetFilePath} media="screen, projection" rel="stylesheet" type="text/css" />;
}

interface Props {
  readonly css: ReadonlyArray<string>;
  readonly js: ReadonlyArray<string>;
  readonly helmet: HelmetData;
  readonly nonce: string;
  readonly reactAppString: string;
  // tslint:disable-next-line no-any
  readonly relay?: (() => any);
  // tslint:disable-next-line no-any
  readonly records?: (() => any);
  readonly styles?: string;
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
  reactAppString,
  relay,
  records,
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
  const inlineScript = (body: string) => (
    <script nonce={nonce} type="text/javascript" dangerouslySetInnerHTML={{ __html: body }} />
  );

  const scriptTag = (src: string, scriptProps: object = {}) => (
    <script {...scriptProps} nonce={nonce} type="text/javascript" src={src} />
  );

  const headerElements = [
    ...css.map(stylesheetTag),
    <link key="font" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet" />,
    <link key="icons" href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />,
    inlineScript(`
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
    `),
    ...addHeadElements(nonce),
    // tslint:disable no-any
    ...(helmet.title.toComponent() as any),
    ...(helmet.base.toComponent() as any),
    ...(helmet.meta.toComponent() as any),
    ...(helmet.link.toComponent() as any),
    ...(helmet.style.toComponent() as any),
    // tslint:enable no-any
    adsenseID === undefined
      ? undefined
      : scriptTag('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          async: true,
        }),
    adsenseID === undefined
      ? undefined
      : inlineScript(`
      (adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "${adsenseID}",
        enable_page_level_ads: true
      });
    `),
  ].filter(utils.notNull);

  const constructScript = () => {
    let script = '';
    if (relay !== undefined) {
      script += `window.__RELAY_DATA__=${serializeJavascript(relay())};`;
    }
    if (records !== undefined) {
      script += `window.__RELAY_RECORDS__=${serializeJavascript(records())};`;
    }
    script += `window.__OPTIONS__=${serializeJavascript(appOptions)};`;
    script += `window.__USER_AGENT__=${serializeJavascript(userAgent)};`;
    script += `window.__CSS__=${serializeJavascript(css)};`;
    script += `window.__NONCE__=${serializeJavascript(nonce)};`;
    script += `window.__NETWORK__=${serializeJavascript(network)};`;
    script += `window.__APP_VERSION__=${serializeJavascript(appVersion)};`;
    script += 'window.__SYMBOL_POLYFILL = !window.Symbol || !!window.Symbol.toStringTag;';

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
    <html lang="en">
      <head>{headerElements}</head>
      <body>
        {bsaElement}
        <div id="app" dangerouslySetInnerHTML={{ __html: reactAppString }} />
        {styles === undefined ? undefined : <style id="jss-server-side">${styles}</style>}
        {constructScript()}
        {js.map((value) => scriptTag(value))}
        {helmet.script.toComponent()}
        {addBodyElements()}
      </body>
    </html>,
  );
  // tslint:enable no-unnecessary-callback-wrapper
};
