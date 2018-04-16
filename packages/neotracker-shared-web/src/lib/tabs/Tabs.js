/* @flow */
import { Link } from 'react-router-dom';
import * as React from 'react';

import classNames from 'classnames';
import { type HOC, compose, pure } from 'recompose';

import { Button, Typography, withStyles } from '../base';

const styles = () => ({
  root: {
    display: 'flex',
  },
  link: {
    textDecoration: 'none',
  },
});

type TabType = {
  className?: string,
  id: string,
  label: string,
  selected: boolean,
  onClick?: () => void,
  href?: string,
};
type ExternalProps = {|
  tabs: Array<TabType>,
  className?: string,
|};
type InternalProps = {|
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Tabs({ tabs, className, classes }: Props): React.Element<*> {
  return (
    <div className={classNames(className, classes.root)}>
      {tabs.map(tab => (
        <Link key={tab.id} className={classes.link} to={tab.href}>
          <Button
            className={tab.className}
            color={tab.selected ? 'primary' : 'default'}
            onClick={tab.onClick}
          >
            <Typography variant="body1" color="inherit">
              {tab.label}
            </Typography>
          </Button>
        </Link>
      ))}
    </div>
  );
}

const enhance: HOC<*, *> = compose(withStyles(styles), pure);

export default (enhance(Tabs): React.ComponentType<ExternalProps>);
