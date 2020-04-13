/* @flow */
import * as React from 'react';
import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { type Theme } from '../../../styles/createTheme';
import { Markdown } from '../../../lib/markdown';
import { withStyles } from '../../../lib/base';

const styles = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    paddingTop: 0,
  },
});

const FAQ = `
## What is MoonPay?
MoonPay is a new way to buy cryptocurrencies like NEO with debit/credit cards
and bank transfers. MoonPay has dozens of partners
that use their API to allow users to buy cryptocurrencies.

Click [here](https://www.moonpay.io/) to learn more about MoonPay.


## How does it work?
1. Select the wallet whose address you want the NEO to be sent to. If you don't have any
wallets open you can either create a new wallet or enter an address in the widget directly.
2. Enter the amount of NEO you want to purchase (minimum of $20 USD, maximum of
$2,200 USD).
3. Press "Buy Now". If you have selected a wallet to send the NEO to then the address
will be shown in the widget. If you have no wallet selected then the address will
be empty and you'll have to enter a valid NEO address that you want your NEO to be
sent to.
4. Press "Buy Now" again and you'll enter your email for confirmation and receipt
purposes.
5. Once your transaction is completed on MoonPay's site you'll be redirected back to
NEO Tracker to see your transaction reflected on the Neo blockchain.


## What payment methods are accepted?
MoonPay accepts debit cards, credit cards, and bank transfers.


## What verification is needed?
MoonPay needs an email for confirmation and receipt purposes.
 U.S. citizens currently cannot buy NEO through MoonPay.


## How secure is it?
NEO Tracker **never** sends your Private Keys or encryped Keystore files
across the network. They are stored locally on your computer. Private Keys are
only ever stored in the current session's memory and are cleared between
sessions. Encrypted Keystore files are stored in local storage and persist across
sessions. If an attacker were to gain access to your browser's local storage, they
would additionally need the password to unlock your encrypted Keystore file in order
to gain access to your Private Keys and thus your balance.


## What if something has gone wrong? What do I do?
If you think something has gone wrong then contact us at [NEO Tracker](https://twitter.com/neotrackerio)
AND contact [MoonPay](mailto:support@moonpay.io).
We will work diligently with you and with MoonPay to help you figure out what
happened and try to remedy the situation.

## What if I have questions, concerns, comments?
The best way to get in contact with us is to Direct Message us at our
official [Twitter](https://twitter.com/neotrackerio) or
[Facebook](https://www.facebook.com/neotracker.io/) accounts.


## We are not responsible for any loss.
Neo, neotracker.io and some of the underlying Javascript libraries we use are
under active development. While we have thoroughly tested, there is always the
possibility something unexpected happens that causes your funds to be lost.
Please do not invest more than you are willing to lose, and please be careful.
`;

type ExternalProps = {|
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SwapFAQView({ className, classes }: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      <Markdown source={FAQ} />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(SwapFAQView): React.ComponentType<ExternalProps>);
