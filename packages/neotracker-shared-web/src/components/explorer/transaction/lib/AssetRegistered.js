/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import classNames from 'classnames';
import { graphql } from 'react-relay';

import { AssetNameLink } from '../../asset/lib';
import { type Theme } from '../../../../styles/createTheme';
import { Typography, withStyles } from '../../../../lib/base';

import { fragmentContainer } from '../../../../graphql/relay';

import { type AssetRegistered_asset } from './__generated__/AssetRegistered_asset.graphql';

const styles = (theme: Theme) => ({
  registeredArea: {
    alignItems: 'center',
    display: 'flex',
    minWidth: '0',
  },
  registered: {
    marginRight: theme.spacing.unit,
  },
});

type ExternalProps = {|
  asset: any,
  className?: string,
|};
type InternalProps = {|
  asset: AssetRegistered_asset,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function AssetRegistered({
  asset,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.registeredArea)}>
      <Typography className={classes.registered} variant="body1">
        Registered
      </Typography>
      <AssetNameLink asset={asset} />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  fragmentContainer({
    asset: graphql`
      fragment AssetRegistered_asset on Asset {
        ...AssetNameLink_asset
      }
    `,
  }),
  withStyles(styles),
  pure,
);

export default (enhance(AssetRegistered): React.ComponentType<ExternalProps>);
