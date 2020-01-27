import * as React from 'react';
import Helmet from 'react-helmet';
import styled, { ThemeProvider } from 'styled-components';
import { AppContext } from './AppContext';
import { AppContextProvider, WithAppOptions, WithRouter } from './components';
import { createTheme } from './theme';

const theme = createTheme();

const Root = styled.div`
  height: 100%;
`;

interface Props {
  readonly appContext: AppContext;
  readonly children?: React.ReactNode;
}
export const AppShell = ({ appContext, children }: Props) => (
  <React.StrictMode>
    <AppContextProvider value={appContext}>
      <ThemeProvider theme={theme}>
        <Root>
          <WithAppOptions>
            {(appOptions) => (
              <WithRouter>
                {({ location }) => {
                  const { title } = appOptions.meta;
                  const path = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
                  const canonicalURL = `${appOptions.url}${path}`;

                  return (
                    <>
                      <Helmet titleTemplate={`%s - ${title}`} defaultTitle={title}>
                        <html lang="en" />
                        <meta name="application-name" content={appOptions.meta.name} />
                        <meta name="description" content={appOptions.meta.description} />
                        <meta charSet="utf-8" />
                        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                        <link rel="manifest" href="/manifest.json" />
                        <link rel="mask-icon" href="/safari-pinned-tab.svg" color={theme.primary} />
                        <meta name="theme-color" content={theme.secondary} />
                        <link rel="canonical" href={canonicalURL} />
                        <script type="application/ld+json">
                          {`{
                      "@context": "http://schema.org",
                      "@type": "WebSite",
                      "name": "${appOptions.meta.name}",
                      "url": "${canonicalURL}"
                    }`}
                        </script>
                      </Helmet>
                      {children}
                    </>
                  );
                }}
              </WithRouter>
            )}
          </WithAppOptions>
        </Root>
      </ThemeProvider>
    </AppContextProvider>
  </React.StrictMode>
);
