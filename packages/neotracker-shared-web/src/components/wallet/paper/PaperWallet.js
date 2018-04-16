/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure, withContext } from 'recompose';

import { type AppContext } from '../../../AppContext';
import { type Theme } from '../../../styles/createTheme';

import { withStyles } from '../../../lib/base';

import PaperWalletHeader from './PaperWalletHeader';
import PaperWalletContent from './PaperWalletContent';

const styles = (theme: Theme) => ({
  root: {
    border: `1px solid ${theme.custom.lightDivider}`,
    display: 'flex',
    height: 290,
    width: 739,
    boxSizing: 'border-box',
  },
});

type ExternalProps = {|
  appContext: AppContext,
  address: string,
  privateKey: string,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function PaperWallet({
  address,
  privateKey,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      <PaperWalletHeader />
      <PaperWalletContent address={address} privateKey={privateKey} />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withContext({ appContext: () => null }, ({ appContext }) => ({ appContext })),
  withStyles(styles),
  pure,
);

export default (enhance(PaperWallet): React.ComponentType<ExternalProps>);
