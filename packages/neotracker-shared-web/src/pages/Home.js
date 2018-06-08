/* @flow */
import { Link } from 'react-router-dom';
import * as React from 'react';

import classNames from 'classnames';
import { compose, getContext, pure } from 'recompose';
import { graphql } from 'react-relay';

import { type Theme } from '../styles/createTheme';
import { MarketCard } from '../components/main/market';
import { MainSelectCard } from '../components/wallet/select';
import { PageError } from '../components/common/error';
import { PageLoading } from '../components/common/loading';
import { Button, Card, Typography, withStyles } from '../lib/base';
import { BlockTable } from '../components/explorer/block';
import { Leaderboard } from '../components/common/advertising';
import { SearchCard } from '../components/explorer/search';
import { TransactionTable } from '../components/explorer/transaction';

import { createSafeRetry } from '../utils';
import * as routes from '../routes';
import { queryRenderer } from '../graphql/relay';

import { type HomeQueryResponse } from './__generated__/HomeQuery.graphql';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      padding: theme.spacing.unit,
    },
    marketCard: {
      marginBottom: theme.spacing.unit,
    },
    leaderboard: {
      '& > ins': {
        marginBottom: theme.spacing.unit,
      },
    },
    blocks: {
      marginBottom: theme.spacing.unit,
    },
    cardHeader: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      padding: theme.spacing.unit * 2,
    },
    marketCard: {
      marginBottom: theme.spacing.unit * 2,
    },
    leaderboard: {
      '& > ins': {
        marginBottom: theme.spacing.unit * 2,
      },
    },
    cardHeader: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
    },
  },
  [theme.breakpoints.down('md')]: {
    blocksAndTransactions: {
      flexWrap: 'wrap',
    },
    blocks: {
      width: '100%',
      marginBottom: theme.spacing.unit * 2,
    },
    transactions: {
      width: '100%',
    },
  },
  [theme.breakpoints.up('md')]: {
    blocks: {
      width: '50%',
    },
    blocksSpacer: {
      paddingRight: theme.spacing.unit,
    },
    transactions: {
      width: '50%',
    },
    transactionsSpacer: {
      paddingLeft: theme.spacing.unit,
    },
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  blocksAndTransactions: {
    display: 'flex',
  },
  marketCard: {},
  blocks: {
    flex: '1 1 auto',
  },
  transactions: {
    flex: '1 1 auto',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    alignItems: 'center',
    borderBottom: `1px solid ${theme.custom.lightDivider}`,
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
  },
  link: {
    textDecoration: 'none',
  },
  blocksSpacer: {},
  transactionsSpacer: {},
  viewMoreButton: {
    height: 32,
    marginBottom: -8,
    marginTop: -8,
    paddingBottom: 0,
    paddingTop: 0,
  },
  viewMoreText: {
    color: theme.custom.colors.common.white,
  },
});

const safeRetry = createSafeRetry();

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  props: ?HomeQueryResponse,
  lastProps?: ?HomeQueryResponse,
  error: ?Error,
  retry: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Home({
  props: propsIn,
  lastProps,
  error,
  retry,
  className,
  classes,
}: Props): React.Element<any> {
  const props = propsIn || lastProps;
  if (props == null && error != null) {
    return <PageError error={error} retry={retry} />;
  }

  if (error != null) {
    safeRetry(retry);
  } else {
    safeRetry.cancel();
  }

  if (props == null) {
    return <PageLoading />;
  }

  const renderCard = (
    title,
    rightElement,
    content,
    cardClassName,
    cardSpacerClassName,
  ) => (
    <div className={cardClassName}>
      <div className={cardSpacerClassName}>
        <Card className={classes.card}>
          <div className={classes.cardHeader}>
            <Typography variant="title">{title}</Typography>
            {rightElement}
          </div>
          {content}
        </Card>
      </div>
    </div>
  );

  const makeViewAllButton = (path: string) => (
    <Link className={classes.link} to={path}>
      <Button
        className={classes.viewMoreButton}
        size="small"
        variant="raised"
        color="primary"
      >
        <Typography className={classes.viewMoreText} variant="body1">
          VIEW ALL
        </Typography>
      </Button>
    </Link>
  );

  return (
    <div className={classNames(className, classes.root)}>
      <SearchCard className={classes.marketCard} />
      <MainSelectCard className={classes.marketCard} />
      <Leaderboard className={classes.leaderboard} />
      <MarketCard
        className={classes.marketCard}
        neo_usd_data_points={props.neo_usd_data_points}
        neo_btc_data_points={props.neo_btc_data_points}
        neo_current_price={props.neo_current_price}
      />
      <div className={classes.blocksAndTransactions}>
        {renderCard(
          'Explore Blocks',
          makeViewAllButton(routes.makeBlockSearch(1)),
          <BlockTable
            blocks={props.blocks.edges.map(edge => edge.node)}
            sizeVisibleAt="xs"
            validatorVisibleAt="md"
          />,
          classes.blocks,
          classes.blocksSpacer,
        )}
        {renderCard(
          'Explore Transactions',
          makeViewAllButton(routes.makeTransactionSearch(1)),
          <TransactionTable
            transactions={props.transactions.edges.map(edge => edge.node)}
            dense
          />,
          classes.transactions,
          classes.transactionsSpacer,
        )}
      </div>
    </div>
  );
}

export default (queryRenderer(graphql`
  query HomeQuery {
    blocks(orderBy: [{ name: "block.id", direction: "desc" }], first: 16) {
      edges {
        node {
          ...BlockTable_blocks
        }
      }
    }
    transactions(
      orderBy: [{ name: "transaction.id", direction: "desc" }]
      filters: [
        { name: "transaction.type", operator: "!=", value: "MinerTransaction" }
      ]
      first: 20
    ) {
      edges {
        node {
          ...TransactionTable_transactions
        }
      }
    }
    neo_btc_data_points: prices(from: "NEO", to: "BTC") {
      ...MarketCard_neo_btc_data_points
    }
    neo_usd_data_points: prices(from: "NEO", to: "USD") {
      ...MarketCard_neo_usd_data_points
    }
    neo_current_price: current_price(sym: "NEO") {
      ...MarketCard_neo_current_price
    }
  }
`)(
  compose(
    getContext({ relayEnvironment: () => null }),
    pure,
    withStyles(styles),
  )(Home),
): React.ComponentType<ExternalProps>);
