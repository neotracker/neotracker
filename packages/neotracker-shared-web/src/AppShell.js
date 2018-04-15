/* @flow */
import Helmet from 'react-helmet';
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, lifecycle, pure } from 'recompose';
import { withRouter } from 'react-router';

import { AppBar } from './components/main/appBar';
import { type AppOptions } from './AppContext';
import { AppFooter } from './components/main/appFooter';
import { GlobalSnackbar } from './components/common/snackbar';
import { type Theme } from './styles/createTheme';

import { mapAppOptions } from './utils';
import { withStyles } from './lib/base';

import * as routes from './routes';

const styles = (theme: Theme) => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.grey[200],
      margin: 0,
    },
  },
  root: {
    height: '100%',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  contentNormal: {
    minHeight: `calc(100% - ${theme.spacing.unit * 8}px)`,
    top: theme.spacing.unit * 8,
  },
  contentWallet: {
    minHeight: `calc(100% - ${theme.spacing.unit * 14}px)`,
    top: theme.spacing.unit * 14,
  },
  contentInner: {
    flex: '1 1 auto',
  },
});

type ExternalProps = {|
  children?: any,
|};
type InternalProps = {|
  location: Object,
  classes: Object,
  theme: Theme,
  appOptions: AppOptions,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function App({
  classes,
  theme,
  children,
  location,
  appOptions,
}: Props): React.Element<*> {
  const { title } = appOptions.meta;
  const path = location.pathname.endsWith('/')
    ? location.pathname.slice(0, -1)
    : location.pathname;
  const canonicalURL = `${appOptions.url}${path}`;
  const isWallet = routes.isWallet(location.pathname);
  const description = isWallet
    ? appOptions.meta.walletDescription
    : appOptions.meta.description;
  return (
    <div className={classes.root}>
      <Helmet titleTemplate={`%s - ${title}`} defaultTitle={title}>
        <html lang="en" />
        <meta name="application-name" content={appOptions.meta.name} />
        <meta name="description" content={description} />
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="mask-icon"
          href="/safari-pinned-tab.svg"
          color={theme.palette.primary[500]}
        />
        <meta name="theme-color" content={theme.palette.secondary.light} />
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
      <AppBar isWallet={isWallet} />
      <div
        className={classNames({
          [classes.content]: true,
          [classes.contentNormal]: true,
        })}
      >
        <div className={classes.contentInner}>{children}</div>
        <AppFooter />
      </div>
      <GlobalSnackbar />
    </div>
  );
}
const enhance: HOC<*, *> = compose(
  withRouter,
  withStyles(styles, { withTheme: true }),
  lifecycle({
    componentDidMount() {
      const jssStyles = document.getElementById('jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    },
  }),
  mapAppOptions,
  pure,
);

export default (enhance(App): React.ComponentType<ExternalProps>);
