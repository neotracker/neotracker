/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { privateKeyToWIF } from '@neo-one/client-common';

import { type Theme } from '../../../styles/createTheme';
import { QRCode } from '../../../lib/qr';

import * as routes from '../../../routes';
import { withStyles } from '../../../lib/base';

import PaperWalletLabeled from './PaperWalletLabeled';
import PaperWalletLabelLine from './PaperWalletLabelLine';

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.unit,
  },
  box: {
    height: theme.spacing.unit * 19,
    width: theme.spacing.unit * 19,
  },
  notes: {
    backgroundColor: theme.palette.grey[200],
  },
  codes: {
    alignItems: 'center',
    display: 'flex',
  },
  lines: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
  },
  privateKey: {
    paddingTop: theme.spacing.unit,
  },
  firstBox: {
    paddingBottom: theme.spacing.unit * 2,
    paddingLeft: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
  },
  secondBox: {
    padding: theme.spacing.unit * 2,
  },
  thirdBox: {
    paddingBottom: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 2,
  },
});

const SIZE = 152;

type ExternalProps = {|
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
function PaperWalletContent({
  address,
  privateKey,
  className,
  classes,
}: Props): React.Element<*> {
  const privateKeyHex = privateKeyToWIF(privateKey);
  const addressHex = address;
  return (
    <div className={classNames(className, classes.root)}>
      <div className={classes.codes}>
        <PaperWalletLabeled
          className={classes.firstBox}
          element={
            <QRCode alt="Address QR Code" size={SIZE} value={addressHex} />
          }
          label="YOUR ADDRESS"
        />
        <PaperWalletLabeled
          className={classes.secondBox}
          element={
            <img
              alt="Notes Area"
              src={routes.makePublic('/notes-bg.png')}
              width={`${SIZE}px`}
              height={`${SIZE}px`}
            />
          }
          label="AMOUNT / NOTES"
        />
        <PaperWalletLabeled
          className={classes.thirdBox}
          element={
            <QRCode
              alt="Private Key QR Code"
              size={SIZE}
              value={privateKeyHex}
            />
          }
          label="YOUR PRIVATE KEY"
        />
      </div>
      <div className={classes.lines}>
        <PaperWalletLabelLine value={addressHex} label="Your Address:" />
        <PaperWalletLabelLine
          className={classes.privateKey}
          value={privateKeyHex}
          label="Your Private Key:"
        />
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(
  PaperWalletContent,
): React.ComponentType<ExternalProps>);
