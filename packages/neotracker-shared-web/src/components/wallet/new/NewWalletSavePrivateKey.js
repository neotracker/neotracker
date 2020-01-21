/* @flow */
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withStateHandlers,
} from 'recompose';
import * as React from 'react';

import { privateKeyToWIF } from '@neo-one/client-common';

import { CopyField } from '../common';
import { PrintPaperWalletButton } from '../paper';
import { type Theme } from '../../../styles/createTheme';

import { withStyles } from '../../../lib/base';

import NewWalletSaveCommon from './NewWalletSaveCommon';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    print: {
      paddingTop: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    print: {
      paddingTop: theme.spacing.unit * 2,
    },
  },
  print: {},
  save: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
  },
  copyField: {
    marginBottom: theme.spacing.unit,
    maxWidth: theme.spacing.unit * 70,
  },
});

type ExternalProps = {|
  privateKey: string,
  address: string,
  allowContinue: boolean,
  onContinue: () => void,
  className?: string,
|};
type InternalProps = {|
  privateKeySaved: boolean,
  onSave: () => void,
  onPrintPaperWallet: () => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function NewWalletSavePrivateKey({
  privateKey,
  address,
  allowContinue,
  onContinue,
  className,
  privateKeySaved,
  onSave,
  classes,
}: Props): React.Element<*> {
  return (
    <NewWalletSaveCommon
      className={className}
      title="Save Your Private Key"
      saveElement={
        <div className={classes.save}>
          <CopyField
            id="nwspk-private-key"
            className={classes.copyField}
            value={privateKeyToWIF(privateKey)}
            name="Private Key"
            label="Private Key"
            onClick={onSave}
          />
          <PrintPaperWalletButton
            className={classes.print}
            address={address}
            privateKey={privateKey}
            onPrint={onSave}
          />
        </div>
      }
      saved={privateKeySaved || allowContinue}
      onContinue={onContinue}
    />
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
  withStateHandlers(
    () => ({
      privateKeySaved: false,
    }),
    { setState: (prevState) => (updater) => updater(prevState) },
  ),
  withHandlers({
    onSave: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        privateKeySaved: true,
      })),
  }),
  withStyles(styles),
);

export default (enhance(
  NewWalletSavePrivateKey,
): React.ComponentType<ExternalProps>);
