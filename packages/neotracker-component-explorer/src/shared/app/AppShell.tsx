import * as React from 'react';
import Helmet from 'react-helmet';
import styled, { ThemeProvider } from 'styled-components';
import { RenderConfig } from '../../types';
import { CodeRevisionProvider, RenderConfigProvider } from './components';
import { theme } from './theme';

const Root = styled.div`
  height: 100%;
`;

interface Props {
  readonly config: RenderConfig;
  readonly codeRevision: number;
  readonly children?: React.ReactNode;
}
export const AppShell = ({ config, codeRevision, children }: Props) => {
  const { title } = config.meta;

  return (
    <RenderConfigProvider value={config}>
      <CodeRevisionProvider value={codeRevision}>
        <ThemeProvider theme={theme}>
          <Root>
            <Helmet titleTemplate={`%s - ${title}`} defaultTitle={title}>
              <html lang="en" />
              <meta name="application-name" content={config.meta.name} />
              <meta name="description" content={config.meta.description} />
              <meta charSet="utf-8" />
              <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
              <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
              <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
              <link rel="manifest" href="/manifest.json" />
              <link rel="mask-icon" href="/safari-pinned-tab.svg" color={theme.primary} />
              <meta name="theme-color" content={theme.secondary} />
            </Helmet>
            {children}
          </Root>
        </ThemeProvider>
      </CodeRevisionProvider>
    </RenderConfigProvider>
  );
};
