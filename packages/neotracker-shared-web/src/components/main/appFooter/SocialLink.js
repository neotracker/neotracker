/* @flow */
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { Link } from '../../../lib/link';

import { withStyles } from '../../../lib/base';

const styles = () => ({
  root: {
    alignItems: 'center',
    display: 'flex',
  },
});

type ExternalProps = {|
  icon: React.Element<any>,
  link: string,
  title: string,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function SocialLink({
  icon,
  link,
  title,
  className,
  classes,
}: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      {icon}
      <Link path={link} title={title} white absolute />
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(SocialLink): React.ComponentType<ExternalProps>);
