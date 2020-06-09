/* @flow */
import * as React from 'react';
import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';
import { type Theme } from '../../../styles/createTheme';
import { Markdown } from '../../../lib/markdown';
import { withStyles } from '../../../lib/base';
import { Disclaimer, MoonPayFAQ, QCC } from '../../faq';

const styles = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    paddingTop: 0,
  },
});

const FAQ = `
${MoonPayFAQ}
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
