/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';

import classNames from 'classnames';

import { Button, Typography, withStyles } from '../../../lib/base';
import { type Theme } from '../../../styles/createTheme';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('sm')]: {
    content: {
      padding: theme.spacing.unit,
    },
    save: {
      paddingBottom: theme.spacing.unit,
      paddingTop: theme.spacing.unit,
    },
  },
  [theme.breakpoints.up('sm')]: {
    content: {
      padding: theme.spacing.unit * 2,
    },
    save: {
      paddingBottom: theme.spacing.unit * 2,
      paddingTop: theme.spacing.unit * 2,
    },
  },
  content: {},
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  textLine: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
  },
  save: {},
  bold: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  firstText: {
    marginRight: theme.spacing.unit / 2,
  },
  footer: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.custom.lightDivider}`,
  },
});

type ExternalProps = {|
  title: string,
  saveElement: React.Element<any>,
  saved: boolean,
  onContinue: () => void,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function NewWalletSaveCommon({
  title,
  saveElement,
  saved,
  onContinue,
  className,
  classes,
}: Props): React.Element<*> {
  const textLines = [
    ['Do not lose it!', 'It cannot be recovered if you lose it.'],
    [
      'Do not share it!',
      'Your funds will be stolen if you use this file on a malicious phishing' +
        ' site.',
    ],
    [
      'Make a backup!',
      'Secure it like the millions of dollars it may one day be worth.',
    ],
  ];
  return (
    <div className={classNames(className, classes.root)}>
      <div className={classes.content}>
        <Typography variant="subheading">{title}</Typography>
        <div className={classes.save}>{saveElement}</div>
        {textLines.map(([first, second]) => (
          <div key={first} className={classes.textLine}>
            <Typography
              variant="body1"
              className={classNames(classes.firstText, classes.bold)}
            >
              {first}
            </Typography>
            <Typography variant="body1">{second}</Typography>
          </div>
        ))}
      </div>
      <div className={classNames(classes.content, classes.footer)}>
        <Button disabled={!saved} color="primary" onClick={onContinue}>
          <Typography color="inherit" variant="body1">
            CONTINUE
          </Typography>
        </Button>
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(
  NewWalletSaveCommon,
): React.ComponentType<ExternalProps>);
