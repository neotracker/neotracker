/* @flow */
// $FlowFixMe
import { ClientError } from '@neotracker/shared-utils';
import { JssProvider, SheetsRegistry } from 'react-jss';
import * as React from 'react';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';

import createGenerateClassName from '@material-ui/core/styles/createGenerateClassName';
import { create } from 'jss';
import preset from 'jss-preset-default';
import { renderToString } from 'react-dom/server';

import type { AppContext } from '../../../AppContext';
import { CodedClientError } from '../../../errors';
import type { Theme } from '../../../styles/createTheme';
import { ThemeProvider } from '../../../lib/base';

import PaperWallet from './PaperWallet';

const stylesheetTag = (sheet: string) =>
  `<link rel="stylesheet" href="${sheet}" type="text/css" />`;
const createPaperWallet = ({
  privateKey,
  address,
  theme,
  appContext,
}: {|
  privateKey: string,
  address: string,
  theme: Theme,
  appContext: AppContext,
|}) => {
  if (typeof window === 'undefined') {
    return;
  }
  const sheetsRegistry = new SheetsRegistry();
  const jss = create(preset());
  jss.options.createGenerateClassName = createGenerateClassName;
  const app = (
    <JssProvider registry={sheetsRegistry} jss={jss}>
      <ThemeProvider theme={theme} sheetsManager={new Map()}>
        <PaperWallet
          appContext={appContext}
          address={address}
          privateKey={privateKey}
        />
      </ThemeProvider>
    </JssProvider>
  );
  const reactAppString = renderToString(app);
  const appStyles = sheetsRegistry.toString();

  const html = `
    <html>
      <head>
        ${appContext.css.map((sheet) => stylesheetTag(sheet)).join('')}
      </head>
      <body style="background-color: white;">
        <div id="app">${reactAppString}</div>
        <style>${appStyles}</style>
        <script
          ${appContext.nonce != null ? `nonce="${appContext.nonce}"` : ''}
          type="text/javascript"
        >
          setTimeout(function () { window.print(); }, 2000);
        </script>
      </body>
    </html>
  `;
  const win = window.open('about:blank', '_blank');
  if (win == null) {
    throw new CodedClientError(
      CodedClientError.CREATE_PAPER_WALLET_WINDOW_OPEN_ERROR,
    );
  } else {
    win.document.write(html);
    win.document.close();
  }
};

export default ({
  privateKey,
  address,
  theme,
  showSnackbarError,
  appContext,
}: {|
  privateKey: string,
  address: string,
  theme: Theme,
  showSnackbarError: (options: {| error: Error |}) => void,
  appContext: AppContext,
|}) => {
  try {
    webLogger.info({ title: 'neotracker_wallet_create_paper_wallet' });
    createPaperWallet({ privateKey, address, theme, appContext });
  } catch (error) {
    webLogger.error({ title: 'neotracker_wallet_create_paper_wallet' });
    showSnackbarError({
      error:
        error instanceof ClientError
          ? error
          : new ClientError(
              'Something went wrong while creating your paper wallet. Please ' +
                'try again or refresh the page.',
            ),
    });
  }
};
