/* @flow */
/* eslint-disable */
import * as React from 'react';

import classNames from 'classnames';
import {
  type HOC,
  compose,
  pure,
  withHandlers,
  withProps,
  withPropsOnChange,
  withState,
} from 'recompose';
import { disassembleByteCode } from '@neo-one/node-core';

import { type Theme } from '../../../styles/createTheme';
import { Button, Typography, withStyles } from '../../../lib/base';

const styles = (theme: Theme) => ({
  script: {
    backgroundColor: theme.palette.grey[200],
    ...(theme.custom.code.text: $FlowFixMe),
    maxHeight: 400,
    maxWidth: '100%',
    resize: 'vertical',
    overflow: 'auto',
    padding: theme.spacing.unit,
    border: `1px solid ${theme.custom.lightDivider}`,
    margin: 0,
  },
  scriptSmall: {
    height: 80,
  },
  scriptLarge: {
    height: 160,
  },
  opCodesScript: {
    whiteSpace: 'nowrap',
  },
  byteCodesScript: {
    wordBreak: 'break-word',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  opCodes: {
    display: 'flex',
  },
  firstOpCodesCol: {
    flex: '0 0 auto',
    marginRight: theme.spacing.unit,
  },
  opCodesCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  footer: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing.unit,
  },
  buttonText: {
    color: theme.custom.colors.common.white,
  },
});

type ExternalProps = {|
  script: string,
  className?: string,
|};
type InternalProps = {|
  showOpCodes: boolean,
  onShowByteCodes: () => void,
  onShowOpCodes: () => void,
  opCodes: ?Array<[string, string]>,
  error: ?Error,
  classes: Object,
|};
type Props = {|
  ...ExternalProps,
  ...InternalProps,
|};
function Script({
  script,
  className,
  showOpCodes,
  onShowByteCodes,
  onShowOpCodes,
  opCodes,
  classes,
}: Props): React.Element<*> {
  let scriptClass;
  let scriptElement;
  let onClick;
  let buttonText;
  if (showOpCodes) {
    if (opCodes != null) {
      scriptClass = classes.opCodesScript;
      scriptElement = (
        <div className={classes.opCodes}>
          <div
            className={classNames(classes.firstOpCodesCol, classes.opCodesCol)}
          >
            {opCodes.map(([value, opCode], idx) => (
              <div key={idx}>{value}</div>
            ))}
          </div>
          <div className={classes.opCodesCol}>
            {opCodes.map(([value, opCode], idx) => (
              <div key={idx}>{opCode}</div>
            ))}
          </div>
        </div>
      );
    } else {
      scriptElement = 'Failed to decompile byte codes.';
    }
    onClick = onShowByteCodes;
    buttonText = 'VIEW BYTECODE';
  } else {
    scriptClass = classes.byteCodesScript;
    scriptElement = script;
    onClick = onShowOpCodes;
    buttonText = 'VIEW OPCODE';
  }

  return (
    <div className={className}>
      <pre
        className={classNames(classes.script, scriptClass, {
          [classes.scriptLarge]: opCodes != null && opCodes.length >= 8,
          [classes.scriptSmall]: opCodes == null || opCodes.length < 8,
        })}
      >
        {scriptElement}
      </pre>
      <div className={classes.footer}>
        <Button color="primary" variant="contained" onClick={onClick}>
          <Typography variant="body1" className={classes.buttonText}>
            {buttonText}
          </Typography>
        </Button>
      </div>
    </div>
  );
}

const enhance: HOC<*, *> = compose(
  withPropsOnChange(['script'], ({ script }) => {
    try {
      return {
        opCodes: disassembleByteCode(Buffer.from(script, 'hex')).map(
          ({ value: original }) => {
            const [idx, value] = original.split(':');
            return [`${idx}:`, value];
          },
        ),
        error: null,
      };
    } catch (error) {
      return {
        opCodes: null,
        error,
      };
    }
  }),
  withState('state', 'setState', () => ({
    showOpCodes: true,
  })),
  withProps(({ state }) => state),
  withHandlers({
    onShowOpCodes: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        showOpCodes: true,
      })),
    onShowByteCodes: ({ setState }) => () =>
      setState((prevState) => ({
        ...prevState,
        showOpCodes: false,
      })),
  }),
  withStyles(styles),
  pure,
);

export default (enhance(Script): React.ComponentType<ExternalProps>);
