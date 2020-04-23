/* @flow */
import * as React from 'react';
import classNames from 'classnames';
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withState,
  withProps,
  getContext,
  lifecycle,
} from 'recompose';
import { graphql } from 'react-relay';
// $FlowFixMe
import { webLogger } from '@neotracker/logger';
import { globalStats } from '@neo-one/client-switch';
import { totalFrameLoads, totalFrameErrors } from '../../../metrics';
import { type Theme } from '../../../styles/createTheme';
import { Card, Button, Typography, withStyles } from '../../../lib/base';
import { Link } from '../../../lib/link';
import { PageLoading } from '../../common/loading';
import type { AppOptions } from '../../../AppContext';
import { createBaseMoonPayUrl, mapAppOptions } from '../../../utils';
import { queryRenderer } from '../../../graphql/relay';
import { PoweredByMoonPay } from './index';
import { Tooltip } from '../../../lib/tooltip';
import * as routes from '../../../routes';
import { type BuyNEOQueryResponse } from './__generated__/BuyNEOCardQuery.graphql';

const responsiveWidthXs = '100%';
const responsiveWidthSm = '90%';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('xs')]: {
    content: {
      padding: theme.spacing.unit,
      flexDirection: 'column',
      alignItems: 'center',
    },
    header: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
    },
    innerTextContent: {
      width: responsiveWidthXs,
    },
    innerFrameContent: {
      width: responsiveWidthXs,
      marginTop: theme.spacing.unit,
    },
    iframe: {
      marginTop: 0,
    },
  },
  [theme.breakpoints.up('sm')]: {
    content: {
      padding: theme.spacing.unit * 2,
      flexDirection: 'column',
      alignItems: 'center',
    },
    header: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
    innerTextContent: {
      width: responsiveWidthSm,
    },
    innerFrameContent: {
      width: responsiveWidthSm,
      marginTop: theme.spacing.unit,
    },
    iframe: {
      marginTop: 0,
    },
  },
  [theme.breakpoints.up('md')]: {
    content: {
      padding: theme.spacing.unit * 2,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    cardHeader: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
    innerTextContent: {
      width: '50%',
    },
    innerFrameContent: {
      width: '50%',
      marginTop: 0,
    },
    iframe: {
      marginTop: '-16px', // brings top of iframe form in line with adjacent content
    },
  },
  root: {},
  header: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
  },
  headerGroup: {
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
    flex: '1 auto',
    flexWrap: 'wrap',
  },
  title: {
    marginTop: theme.spacing.unit / 2,
    marginBottom: theme.spacing.unit / 2,
    marginRight: theme.spacing.unit,
    minWidth: 0,
  },
  content: {
    display: 'flex',
  },
  innerTextContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    height: '100%',
  },
  innerFrameContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    height: '470px',
  },
  iframeLoading: {
    display: 'none',
  },
  iframe: {
    border: 'none',
    height: '100%',
    width: '480px',
  },
  buttonText: {
    color: theme.custom.colors.common.white,
  },
  toggleNullAddressButton: {},
});

type ExternalProps = {|
  address?: any,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
  hideSpinner: () => void,
  onFrameError: () => void,
  showSpinner: () => void,
  toggleNullAddress: () => void,
  useNullAddress: boolean,
  isLoading: boolean,
  appOptions: AppOptions,
  moonpayUrl: string,
  moonpaySecureUrl: string,
  props: ?BuyNEOQueryResponse,
  lastProps: ?BuyNEOQueryResponse,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function BuyNEOCard({
  className,
  classes,
  appOptions,
  hideSpinner,
  onFrameError,
  isLoading,
  useNullAddress,
  toggleNullAddress,
  address,
  moonpayUrl,
  props,
  lastProps,
}: Props): React.Element<*> {
  let currentProps;
  if (props != null) {
    currentProps = props;
  } else if (lastProps != null) {
    currentProps = lastProps;
  }

  let secureUrl = createBaseMoonPayUrl({
    moonpayPublicApiKey: appOptions.moonpayPublicApiKey,
    moonpayUrl: appOptions.moonpayUrl,
    redirectLink: appOptions.url,
  });
  if (
    !useNullAddress &&
    currentProps &&
    currentProps.moonpay &&
    currentProps.moonpay.secureUrl
  ) {
    secureUrl = currentProps.moonpay.secureUrl;
  }

  const toggleButton = (
    <Tooltip
      title={
        'The widget below will automatically use the address from the wallet' +
        " you have selected. If you want to enter a different address that's" +
        ' not in your wallet you can press this button to do that.'
      }
      position="bottom"
    >
      <Button
        className={classes.toggleNullAddressButton}
        variant="contained"
        color="primary"
        onClick={toggleNullAddress}
      >
        <Typography className={classes.buttonText} variant="body1">
          {useNullAddress ? 'USE WALLET ADDRESS' : 'ENTER ADDRESS MANUALLY'}
        </Typography>
      </Button>
    </Tooltip>
  );

  const frameSupportMessage = (
    <Typography variable="body1">
      You need to enable support for iframes to use this feature. Your browser
      may not support iframes.
    </Typography>
  );

  return (
    <Card className={classNames(className, classes.root)}>
      <div className={classes.header}>
        <div className={classes.headerGroup}>
          <Typography className={classes.title} variant="title" component="h1">
            Buy NEO
          </Typography>
          {address ? toggleButton : null}
        </div>
        <Link
          className={classes.buttonMargin}
          path={routes.SWAP_FAQ}
          title="FAQ"
          variant="subheading"
          component="p"
        />
      </div>
      <div className={classes.content}>
        <div className={classes.innerTextContent}>
          <PoweredByMoonPay />
        </div>
        <div className={classes.innerFrameContent}>
          {isLoading ? <PageLoading className={classes.iframe} /> : null}
          <iframe
            referrerPolicy="no-referrer"
            name="Buy NEO Frame"
            title="Buy NEO"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={hideSpinner}
            onError={onFrameError}
            className={isLoading ? classes.iframeLoading : classes.iframe}
            src={address ? secureUrl : moonpayUrl}
          >
            {frameSupportMessage}
          </iframe>
        </div>
      </div>
    </Card>
  );
}

const enhance: HOC<*, *> = compose(
  queryRenderer(
    graphql`
      query BuyNEOCardQuery($url: String!) {
        moonpay(url: $url) {
          secureUrl
        }
      }
    `,
    {
      skipNullVariables: true,
      mapPropsToVariables: {
        client: ({ address, moonpayUrl }) =>
          address == null ? null : { url: moonpayUrl },
      },
      cacheConfig: { force: true },
    },
  ),
  withState('state', 'setState', () => ({
    isLoading: true,
    useNullAddress: false,
  })),
  withProps(({ state }) => state),
  withHandlers({
    onFrameError: () => () => {
      webLogger.error({ title: 'neotracker_swaps_iframe_error' });
      globalStats.record([
        {
          measure: totalFrameErrors,
          value: 1,
        },
      ]);
    },
    hideSpinner: ({ setState }) => () => {
      webLogger.info({ title: 'neotracker_swaps_iframe_loaded' });
      globalStats.record([
        {
          measure: totalFrameLoads,
          value: 1,
        },
      ]);
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
      }));
    },
    showSpinner: ({ setState }) => () => {
      setState((prevState) => ({
        ...prevState,
        isLoading: true,
      }));
    },
    toggleNullAddress: ({ setState }) => () => {
      setState((prevState) => ({
        ...prevState,
        useNullAddress: !prevState.useNullAddress,
      }));
    },
  }),
  lifecycle({
    componentDidUpdate(prevProps) {
      if (
        (this.props.address !== prevProps.address &&
          this.props.isLoading === false &&
          !this.props.useNullAddress) ||
        this.props.useNullAddress !== prevProps.useNullAddress
      ) {
        this.props.showSpinner();
      }
    },
  }),
  getContext({ relayEnvironment: () => null }),
  withStyles(styles),
  mapAppOptions,
  pure,
);

export default (enhance(BuyNEOCard): React.ComponentType<ExternalProps>);
