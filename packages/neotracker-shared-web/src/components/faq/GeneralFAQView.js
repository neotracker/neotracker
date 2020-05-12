/* @flow */
import * as React from 'react';
import { MINIMUM_NETWORK_FEE } from '@neotracker/shared-utils';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { type Theme } from '../../styles/createTheme';
import { Markdown } from '../../lib/markdown';

import { withStyles } from '../../lib/base';

const styles = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    paddingTop: 0,
  },
});

export const CoreWalletFAQ = `
## What is the NEO Tracker wallet?
The NEO Tracker wallet is a light wallet that lets NEO holders interact with
the Neo blockchain. You do not create an account or give us your funds to hold
onto. No data leaves your computer or your browser. We make it easy for you to
create, save, and access your information and interact with the Neo blockchain.

## How does it work?
Light wallet means that the NEO Tracker wallet does not require syncing locally with
the blockchain and instead, uses a remote server, namely NEO Tracker's blockchain
explorer, to fetch data like the transaction history or the amount of GAS
available to claim. Note that **none** of your personal data is ever sent to
NEO Tracker. Specifically, your Private Keys and encrypted Keystore files never
leave your local computer.

## My transfer didn't go through. What happened?
There are several possibilities for why a transaction didn't work. First, it could be
that the transaction was sent to a Neo "node" that has stalled. If that's the case
you just need to wait a minute and try again. Second, it could be that the transaction
was too large (too many inputs and outputs). If that's the case you may need to add
a base network fee of 0.001 GAS plus 0.00001 GAS per byte of the transaction. Third,
it could be that the network is busy and your transaction is not making into the
next block. If that's the case then you can add a network fee to your transaction
which will incentivize the block "miners" to include your transaction in the next block.

## How do I add a transaction fee (AKA network fee) to my transfers?
To make a transfer you must unlock your wallet. Once you unlock your wallet you
will see the input for "Optional Network Fee". If you would like to add a network
fee to your transfer you can enter the fee amount here. This fee will come from
your wallet's GAS balance and will be paid to the block miner for including your
transaction in their block. The minimum network fee allowed is ${MINIMUM_NETWORK_FEE}
GAS. Adding a transaction fee is completely optional and is usually unnecessary.
Our recommended fee is the average network fee of the last 30 transactions on the blockchain,
excluding Miner transactions. If the average is below the minimum network fee it then
the recommendation will be 0.

## How secure is it?
NEO Tracker **never** sends your Private Keys or encryped Keystore files
across the network. They are stored locally on your computer. Private Keys are
only ever stored in the current session's memory and are cleared between
sessions. Encrypted Keystore files are stored in local storage and persist across
sessions. If an attacker were to gain access to your browser's local storage, they
would additionally need the password to unlock your encrypted Keystore file in order
to gain access to your Private Keys and thus your balance.

## How can I trust the NEO Tracker application?
NEO Tracker is completely open-source and is available on [GitHub](https://github.com/neotracker/neotracker)
for you to verify. We serve NEO Tracker over SSL (HTTPS) which eliminates the
possibility of tampering with the Javascript code between our servers and your
browser. Still not sure? Download and use a local standalone version of the NEO Tracker wallet.
Go to our GitHub for the latest [release](https://github.com/neotracker/neotracker-wallet/releases)
and open it using your browser. Alternatively, you can build directly from the source.

## What if I forget my encrypted Keystore file's password or lose my Private Key?
NEO Tracker Wallet does not hold your keys for you. We cannot access accounts,
recover keys, reset passwords, nor reverse transactions. Protect your keys and
always check that you are on the correct URL. You are responsible for your security.
`;

export const QCC = `
## What if I have questions, concerns, comments?

The best way to get in contact with us is to Direct Message us at our official
[Twitter](https://twitter.com/neotrackerio) or [Facebook](https://www.facebook.com/neotracker.io/)
accounts.
`;

export const Disclaimer = `
## We are not responsible for any loss.

Neo, neotracker.io and some of the underlying Javascript libraries we use are
under active development. While we have thoroughly tested, there is always the
possibility something unexpected happens that causes your funds to be lost.
Please do not invest more than you are willing to lose, and please be careful.
`;

const RPXQuestion = `
## An Address I want to see is seemingly loading forever. What's going on?
We are aware of a bug in NEO Tracker that causes this error on addresses that have the
RPX (Red Pulse Phoenix) token. This is an issue with NEO Tracker and not with the Neo blockchain, RPX token,
or that Address. This is currently our top priority to fix and will be fixed soon.
If you think something else is wrong or you are still concerned please reach out to us on
[Twitter](https://twitter.com/neotrackerio) or [Facebook](https://www.facebook.com/neotracker.io/).
`;

const GeneralFAQ = `
## How do I create a wallet?

1. Go to [NEO Tracker Wallet](https://neotracker.io/wallet)
2. Click "NEW WALLET"
3. Create a password
4. Download your Encrypted Keystore file
5. Save your Private Key securely

NOTE: There is no way to recover a wallet if you lose all your private key information.

## How do I open my wallet?

After you have created your wallet and have saved your Private Key and Keystore file properly,
you can then open and use the wallet.

You can open your wallet by following these steps:

1. Go to [NEO Tracker](https://neotracker.io/)
2. Click "Open Wallet"
3. Choose the option you prefer:
    - Keystore File
    - Private Key
    - Encrypted Key
4. Follow the prompts for the option you selected
5. Click "Unlock"

## What will I find in my wallet?

Once you are in your wallet you will be able to access and do the following:

- View account balance - this can also be seen without opening your wallet
- Claim GAS
- Transfer assets and tokens
- View transaction and transfer history - this can also be seen without opening your wallet
- View your Address, Private Key, Create a Keystore file and Print Paper Wallet. If you happen to lose one of the pieces of information above you can open your wallet to
    recover the lost piece. If you lose ALL of your private information there is no way to
    recover it. Protect your keys!

## How do I send a transaction?

1. Go to [NEO Tracker Wallet](https://neotracker.io/wallet)
2. Open your wallet
3. Go to the "Transfer" box
4. Under "To Address" enter the Address you would like to send your Assets or Tokens to
5. Under "Amount" enter the amount you would like to send
6. To the right of "Amount" find "Select Asset" and choose which asset or token you would like to send
7. Verify that all information you have entered is correct
8. Click "Send"
9. A confirmation box will appear for you to confirm you would like to place the transaction

After you confirm the transaction you will be given a Transaction Hash, which you can use to search
for the transaction. You can also find your transactions when you search your public wallet Address
under the “Transactions” or “Transfers” portion of your wallet. Note that it may take a few minutes
for the details of the transaction to show up on NEO Tracker or on other Neo blockchain explorers.

## How do I check my balance?

If you would like to view your account balance and not send any transactions you only need your public
wallet Address in order to search your wallet on NEO Tracker. This helps to limit the amount of times
you have to open your wallet.

Steps to check your balance without opening your wallet:

1. Go to [NEO Tracker](https://neotracker.io/)
2. At the top of the page under "Blockchain Explorer" enter your public Address
3. Click "Search"
4. This will pull up your account balance and transaction history

Note: In the same space you searched your public Address you can also search by Transaction hash, Block hash,
or Block index.

## What steps can I take to protect myself?

1. Bookmark [NEO Tracker Wallet](https://neotracker.io/wallet)
    - Going to the bookmark instead of typing in the web address ensures that you are going to the correct NEO Tracker every time
2. Install the [MetaCert](https://chrome.google.com/webstore/detail/cryptonite-by-metacert/keghdcpemohlojlglbiegihkljkgnige?hl=en) browser extension
3. Watch for phishing attempts
    - Do not click on links sent via messaging or email including addresses, web-links, etc.
    - If you click on a link that seems like a scam, do not enter your private information
    - No one is giving away free NEO. Don't follow links that say they are!
    - If you receive a link that looks/feels like a scam, feel free to reach out to our support channels to verify. Chances are...it is a scam!
4. Unlock your wallet only when necessary
    - You can view your account balance without unlocking your wallet by entering your public Address on [NEO Tracker.](https://neotracker.io/)
5. Use the Keystore file to store your private key
`;

const FAQ = `
${RPXQuestion}
${CoreWalletFAQ}
${GeneralFAQ}
${Disclaimer}
${QCC}
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
function GeneralFAQView({ className, classes }: Props): React.Element<*> {
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

export default (enhance(GeneralFAQView): React.ComponentType<ExternalProps>);
