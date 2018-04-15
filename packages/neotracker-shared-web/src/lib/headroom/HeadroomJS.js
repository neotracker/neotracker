/* @flow */
import * as React from 'react';

import classNames from 'classnames';

import { withStyles } from '../base';

const styles = (theme: any) => ({
  fixed: {
    left: 0,
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: 1100,
  },
  headroom: {
    transition: theme.transitions.create(['transform']),
    willChange: 'transform',
  },
  pinned: {
    transform: 'translateY(0%)',
  },
  unpinned: {
    transform: 'translateY(-100%)',
  },
  disableHidden: {
    '&$unpinned': {
      transform: 'translateY(0%)',
    },
  },
});

class HeadroomJS extends React.Component<any> {
  _headroom: any;

  componentWillUnmount(): void {
    if (this._headroom != null) {
      this._headroom.destroy();
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div
        data-test={this.props['data-test']}
        className={classNames(
          {
            [classes.fixed]: true,
            [classes.disableHidden]: this.props.disableHidden,
          },
          this.props.className,
        )}
        ref={this.setupHeadroom}
      >
        {this.props.children}
      </div>
    );
  }

  setupHeadroom = (ref: any) => {
    if (this._headroom == null && ref != null) {
      const { classes } = this.props;
      // eslint-disable-next-line
      const Headroom = require('headroom.js');
      this._headroom = new Headroom(ref, {
        offset: this.props.offset,
        tolerance: {
          up: 30,
          down: 0,
        },
        classes: {
          initial: classes.headroom,
          pinned: classes.pinned,
          unpinned: classes.unpinned,
        },
      });
      this._headroom.init();
    }
  };
}

export default withStyles(styles)(HeadroomJS);
