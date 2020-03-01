/* @flow */
import { type HOC, compose, pure } from 'recompose';
import * as React from 'react';
import { sha3_256 } from 'js-sha3';
import { type Theme } from '../../../styles/createTheme';
import { Card, withStyles } from '../../../lib/base';
import { CenteredView } from '../../../lib/layout';
import CommonHeader from '../../common/view/CommonHeader';
import { EcosystemCard } from '../common';
import cards from './cards';

const styles = (theme: Theme) => ({
  [theme.breakpoints.down('xs')]: {
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gridGap: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 2}px`,
      padding: theme.spacing.unit * 2,
    },
  },
  [theme.breakpoints.up('sm')]: {
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridGap: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 2}px`,
      padding: theme.spacing.unit * 2,
    },
  },
  [theme.breakpoints.up('lg')]: {
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gridGap: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 2}px`,
      padding: theme.spacing.unit * 2,
    },
  },
});

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
function MainEcosystemView({ className, classes }: Props): React.Element<any> {
  return (
    <CenteredView className={className}>
      <Card>
        <CommonHeader name="Ecosystem" pluralName="Ecosystem" />
        <div className={classes.grid}>
          {cards.map(({ title, description, link, image, cover }) => (
            <EcosystemCard
              key={sha3_256(title)}
              title={title}
              description={description}
              link={link}
              className={className}
              image={image}
              cover={cover}
            />
          ))}
        </div>
      </Card>
    </CenteredView>
  );
}

const enhance: HOC<*, *> = compose(
  withStyles(styles),
  pure,
);

export default (enhance(MainEcosystemView): React.ComponentType<Props>);
