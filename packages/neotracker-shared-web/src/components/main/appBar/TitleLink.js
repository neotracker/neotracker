/* @flow */
import { Link } from 'react-router-dom';
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { TitleLogo } from '../../common/logo';

import * as routes from '../../../routes';
import { withStyles } from '../../../lib/base';

const styles = () => ({
  link: {
    textDecoration: 'none',
  },
});

type ExternalProps = {|
  id: string,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function TitleLink({ id, className, classes }: Props): React.Element<*> {
  return (
    <Link className={classNames(className, classes.link)} to={routes.HOME}>
      <TitleLogo id={id} />
    </Link>
  );
}

const enhance: HOC<*, *> = compose(withStyles(styles), pure);

export default (enhance(TitleLink): React.ComponentType<ExternalProps>);
