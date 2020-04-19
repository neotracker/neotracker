import * as React from 'react';
import styled from 'styled-components';
import { prop, withProp } from 'styled-tools';
import { Hidden, Typography as MuiTypography } from '../../../lib/base';

// [theme.breakpoints.down('sm')]: {
//   paddingLeft: {
//     paddingLeft: theme.spacing.unit,
//   },
//   firstCol: {
//     paddingLeft: theme.spacing.unit,
//   },
// },
// [theme.breakpoints.up('sm')]: {
//   paddingLeft: {
//     paddingLeft: theme.spacing.unit * 3,
//   },
//   firstCol: {
//     paddingLeft: theme.spacing.unit * 2,
//   },
// },
// [theme.breakpoints.up('md')]: {
//   paddingLeft: {
//     paddingLeft: theme.spacing.unit * 5,
//   },
// },

const StyledDiv = styled.div`
  .paddingLeft {
    @media (max-width: ${prop('theme.breakpoints.sm')}) {
      padding-left: ${prop('theme.spacing.unit')};
    }
    @media (max-width: ${prop('theme.breakpoints.md')}) {
      padding-left: ${withProp('theme.spacing.unit', (spacing) => `${spacing * 3}px`)};
    }
    @media (max-width: ${prop('theme.breakpoints.lg')}) {
      padding-left: ${withProp('theme.spacing.unit', (spacing) => `${spacing * 2}px`)};
    }
  }
  .firstCol {
    @media (max-width: ${prop('theme.breakpoints.sm')}) {
      padding-left: ${prop('theme.spacing.unit')};
    }
    @media (max-width: ${prop('theme.breakpoints.md')}) {
      padding-left: ${withProp('theme.spacing.unit', (spacing) => `${spacing * 5}px`)};
    }
    @media (max-width: ${prop('theme.breakpoints.lg')}) {
      padding-left: ${withProp('theme.spacing.unit', (spacing) => `${spacing * 5}px`)};
    }
  }
  .baseRow {
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${prop('theme.custom.lightDivider')};
    min-height: 48;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row {
    font-family: ${prop('theme.typography.fontFamily')};
  }
  .oddRow {
    background-color: ${prop('theme.custom.lightDivider')};
  }
  .numberic {
    justify-content: flex-end;
    text-align: right;
  }
  .root {
    flex: 1 1 auto;
    flex-direction: column;
  }
  .alwaysVisible {
    display: flex;
  }
  .minWidth {
    min-width: 0;
  }
`;

const Typography = styled(MuiTypography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  .row {
    font-family: ${prop('theme.typography.fontFamily')};
    font-size: 14;
    font-weight: ${prop('theme.typography.fontWeightRegular')};
    color: ${prop('theme.pallette.text.primary')};
  }
  .header {
    font-family: ${prop('theme.typography.fontFamily')};
    font-size: 13;
    font-weight: ${prop('theme.typography.fontWeightMedium')};
    color: ${prop('theme.palette.text.seconday')};
  }
`;

interface Props {
  readonly name: string;
  readonly values: ReadonlyArray<string | React.ReactElement>;
  readonly numeric?: boolean;
  readonly minWidth?: boolean;
  readonly visibleAt?: string;
  readonly firstCol: boolean;
  readonly getRowHeight?: (idx: number) => number | undefined;
}

export const Column = ({
  name,
  values,
  numeric,
  minWidth,
  visibleAt,
  firstCol,
  getRowHeight: getRowHeightIn,
}: Props) => {
  const getRowHeight = getRowHeightIn === undefined ? (_idx: number) => undefined : getRowHeightIn;
  const wrapValue = (value: string | React.ReactElement) =>
    typeof value === 'string' ? (
      <Typography className="row" variant="body1">
        {value}
      </Typography>
    ) : (
      value
    );
  const cells = values.map((value, idx) => {
    let style;
    const rowHeight = getRowHeight(idx);
    if (rowHeight !== undefined) {
      style = { height: rowHeight };
    }

    return (
      <StyledDiv
        key={idx}
        className={`${!firstCol ? 'paddingLeft' : ''}
           ${firstCol ? 'firstCol' : ''}
           baseRow
           row
           ${idx % 2 === 1 ? 'oddRow' : ''}
           ${!!numeric ? 'numeric' : ''}
          `}
        style={style}
      >
        {wrapValue(value)}
      </StyledDiv>
    );
  });
  const element = (
    <StyledDiv
      className={`root
         alwaysVisible
         ${!minWidth ? 'minWidth' : ''}
        `}
    >
      <StyledDiv
        className={`${!firstCol ? 'paddingLeft' : ''}
           ${firstCol ? 'firstCol' : ''}
           baseRow
           ${!!numeric ? 'numeric' : ''}
          `}
      >
        <Typography className="header" variant="body1">
          {name}
        </Typography>
      </StyledDiv>
      {cells}
    </StyledDiv>
  );

  if (process.env.BUILD_FLAG_IS_SERVER) {
    return element;
  }

  return (
    <Hidden
      xsDown={visibleAt === 'xs'}
      smDown={visibleAt === 'sm'}
      mdDown={visibleAt === 'md'}
      lgDown={visibleAt === 'lg'}
      xlDown={visibleAt === 'xl'}
      implementation="js"
    >
      {element}
    </Hidden>
  );
};
