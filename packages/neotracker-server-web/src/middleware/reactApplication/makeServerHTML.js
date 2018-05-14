/* @flow */
/* eslint-disable react/no-danger */
import type { AppOptions } from 'neotracker-shared-web';
import type { UserAgent } from 'neotracker-shared-utils';
import * as React from 'react';
import type { NetworkType } from '@neo-one/client';

import { renderToStaticMarkup } from 'react-dom/server';
import serialize from 'serialize-javascript';

function stylesheetTag(stylesheetFilePath) {
  return (
    <link
      href={stylesheetFilePath}
      media="screen, projection"
      rel="stylesheet"
      type="text/css"
    />
  );
}

export type AddHeadElements = (nonce: string) => Array<React.Element<*>>;
export type AddBodyElements = () => Array<React.Element<*>>;

type Props = {|
  css: Array<string>,
  js: Array<string>,
  helmet: Object,
  nonce: string,
  reactAppString: string,
  relay?: () => Object,
  records?: () => Object,
  styles?: string,
  userAgent: UserAgent,
  network: NetworkType,
  appOptions: AppOptions,
  appVersion: string,
  addHeadElements: AddHeadElements,
  addBodyElements: AddBodyElements,
  adsenseID?: string,
|};
export default ({
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
}: Props) => {
  // Creates an inline script definition that is protected by the nonce.
  const inlineScript = body => (
    <script
      nonce={nonce}
      type="text/javascript"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );

  const scriptTag = (src: string, scriptProps: Object = {}) => (
    <script {...scriptProps} nonce={nonce} type="text/javascript" src={src} />
  );

  const headerElements = [
    ...css.map(sheet => stylesheetTag(sheet)),
    <link
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
      rel="stylesheet"
    />,
    <link
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet"
    />,
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
    ...helmet.title.toComponent(),
    ...helmet.base.toComponent(),
    ...helmet.meta.toComponent(),
    ...helmet.link.toComponent(),
    ...helmet.style.toComponent(),
    adsenseID == null
      ? undefined
      : scriptTag('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          async: true,
        }),
    adsenseID == null
      ? undefined
      : inlineScript(`
      (adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "${adsenseID}",
        enable_page_level_ads: true
      });
    `),
  ].filter(Boolean);

  const constructScript = () => {
    let script = '';
    if (relay != null) {
      script += `window.__RELAY_DATA__=${serialize(relay())};`;
    }
    if (records != null) {
      script += `window.__RELAY_RECORDS__=${serialize(records())};`;
    }
    script += `window.__OPTIONS__=${serialize(appOptions)};`;
    script += `window.__USER_AGENT__=${serialize(userAgent)};`;
    script += `window.__CSS__=${serialize(css)};`;
    script += `window.__NONCE__=${serialize(nonce)};`;
    script += `window.__NETWORK__=${serialize(network)};`;
    script += `window.__APP_VERSION__=${serialize(appVersion)};`;
    script +=
      'window.__SYMBOL_POLYFILL = !window.Symbol || !!window.Symbol.toStringTag;';

    return inlineScript(script);
  };

  return renderToStaticMarkup(
    <html lang="en">
      <head>{headerElements}</head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{ __html: reactAppString }} />
        {styles == null ? null : <style id="jss-server-side">${styles}</style>}
        {constructScript()}
        {js.map(script => scriptTag(script))}
        {helmet.script.toComponent()}
        {addBodyElements()}
      </body>
    </html>,
  );
};
