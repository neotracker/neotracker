/* @flow */
import {
  type HOC,
  withHandlers,
  withState,
  withProps,
  compose,
  pure,
} from 'recompose';
import * as React from 'react';
import classNames from 'classnames';
import * as routes from '../../../routes';
import { type Theme } from '../../../styles/createTheme';
import { withStyles, Typography, CardMedia } from '../../../lib/base';
import { TitleCard } from '../../../lib/layout';

const styles = (theme: Theme) => ({
  root: {},
  text: {
    padding: theme.spacing.unit * 2,
    height: theme.spacing.unit * 14,
    overflowY: 'scroll',
    overflowX: 'hidden',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    scrollbarWidth: 'none',
  },
  [theme.breakpoints.down('xs')]: {
    cardCommon: {
      transition: '.4s ease box-shadow',
      borderRadius: '4px',
    },
  },
  [theme.breakpoints.up('sm')]: {
    cardCommon: {
      transition: '.4s ease box-shadow',
      borderRadius: '4px',
    },
  },
  [theme.breakpoints.up('lg')]: {
    cardCommon: {
      transition: '.4s ease box-shadow',
      borderRadius: '4px',
    },
  },
  cardHover: {
    boxShadow: `
    ${theme.spacing.unit * 0}px ${theme.spacing.unit * 1}px ${theme.spacing
      .unit * 3}px ${theme.spacing.unit * 0}px rgba(0,0,0,0.2),
    ${theme.spacing.unit * 0}px ${theme.spacing.unit * 1}px ${theme.spacing
      .unit * 1}px ${theme.spacing.unit * 0}px rgba(0,0,0,0.14),
    ${theme.spacing.unit * 0}px ${theme.spacing.unit * 2}px ${theme.spacing
      .unit * 1}px -${theme.spacing.unit * 1}px rgba(0,0,0,0.12)
    `,
    cursor: 'pointer',
  },
  cardNoHover: {},
  media: {
    height: 140,
  },
  mediaCover: {
    objectFit: 'cover',
  },
  mediaContain: {
    objectFit: 'contain',
  },
});

type InternalProps = {|
  classes: Object,
  onCardEnter: () => void,
  onCardLeave: () => void,
  displayHover: boolean,
|};
type ExternalProps = {|
  className?: string,
  title: string,
  description: string,
  link: string,
  image: string,
  cover: boolean,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function EcosystemCard({
  classes,
  title,
  description,
  link,
  onCardEnter,
  onCardLeave,
  displayHover,
  image,
  cover,
}: Props): React.Element<any> {
  const openLink = () => {
    window.open(link, '_blank', 'noreferrer,noopener');
  };
  return (
    <div
      className={classNames(
        classes.cardCommon,
        displayHover ? classes.cardHover : classes.cardNoHover,
      )}
      role="presentation"
      onClick={openLink}
      onMouseEnter={onCardEnter}
      onMouseLeave={onCardLeave}
    >
      <TitleCard title={title} className={classes.cardCommon}>
        <CardMedia
          component="img"
          className={classNames(
            classes.media,
            cover ? classes.mediaCover : classes.mediaContain,
          )}
          src={routes.makePublic(`/${image}`)}
          title={title}
        />
        <Typography className={classes.text} variant="body1">
          {description}
        </Typography>
      </TitleCard>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withState('state', 'setState', () => ({
    displayHover: false,
  })),
  withProps(({ state }) => state),
  withHandlers({
    onCardEnter: ({ setState }) => () => {
      setState((prevState) => ({
        ...prevState,
        displayHover: true,
      }));
    },
    onCardLeave: ({ setState }) => () => {
      setState((prevState) => ({
        ...prevState,
        displayHover: false,
      }));
    },
  }),
  withStyles(styles),
  pure,
);

export default (enhance(EcosystemCard): React.ComponentType<Props>);
