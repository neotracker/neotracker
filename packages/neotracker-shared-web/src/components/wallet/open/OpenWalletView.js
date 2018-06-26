/* @flow */
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withProps,
  withState,
} from 'recompose';
import * as React from 'react';

import classNames from 'classnames';

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  withStyles,
} from '../../../lib/base';
import { type Theme } from '../../../styles/createTheme';

import OpenWalletKeystore from './OpenWalletKeystore';
import OpenWalletPrivateKey from './OpenWalletPrivateKey';
import OpenWalletEncryptedKey from './OpenWalletEncryptedKey';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    root: {
      paddingLeft: theme.spacing.unit,
      paddingTop: theme.spacing.unit,
    },
    margin: {
      marginRight: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    root: {
      paddingLeft: theme.spacing.unit * 2,
      paddingTop: theme.spacing.unit * 2,
      paddingBottom: theme.spacing.unit,
    },
    margin: {
      marginRight: theme.spacing.unit * 2,
    },
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  margin: {
    marginBottom: theme.spacing.unit,
  },
});

type Option = 'keystore' | 'privatekey' | 'encryptedkey';

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  option: Option,
  onSelectOption: (event: Object, option: string) => void,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function OpenWalletView({
  className,
  option,
  onSelectOption,
  classes,
}: Props): React.Element<*> {
  let open;
  switch (option) {
    case 'keystore':
      open = <OpenWalletKeystore className={classes.margin} />;
      break;
    case 'privatekey':
      open = <OpenWalletPrivateKey className={classes.margin} />;
      break;
    case 'encryptedkey':
      open = <OpenWalletEncryptedKey className={classes.margin} />;
      break;
    default:
      open = null;
  }
  return (
    <div className={classNames(className, classes.root)}>
      <FormControl className={classes.margin} required>
        <FormLabel>How would you like to access your wallet?</FormLabel>
        <RadioGroup
          aria-label="Open Wallet"
          name="open-wallet"
          value={option}
          onChange={onSelectOption}
        >
          <FormControlLabel
            value="keystore"
            control={<Radio />}
            label="Keystore File"
          />
          <FormControlLabel
            value="privatekey"
            control={<Radio />}
            label="Private Key"
          />
          <FormControlLabel
            value="encryptedkey"
            control={<Radio />}
            label="Encrypted Key"
          />
        </RadioGroup>
      </FormControl>
      {open}
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withState('state', 'setState', () => ({
    option: null,
  })),
  withProps(({ state }) => state),
  withHandlers({
    onSelectOption: ({ setState }) => (event, option) =>
      setState((prevState) => ({
        ...prevState,
        option,
      })),
  }),
  withStyles(styles),
  pure,
);

export default (enhance(OpenWalletView): React.ComponentType<ExternalProps>);
