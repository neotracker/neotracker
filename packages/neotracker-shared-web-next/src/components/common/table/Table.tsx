import * as React from 'react';
import styled from 'styled-components';
import { prop, withProp } from 'styled-tools';
import { Column } from './Column';

//   [theme.breakpoints.down('sm')]: {
//     root: {
//       '& > div:last-child > div': {
//         paddingRight: theme.spacing.unit,
//       },
//     },
//   },
//   [theme.breakpoints.up('sm')]: {
//     root: {
//       '& > div:last-child > div': {
//         paddingRight: theme.spacing.unit * 2,
//       },
//     },
//   },

const Root = styled.div`
  display: flex;
  @media (max-width: ${prop('theme.breakpoints.sm')}) {
    & > div:last-child > div {
      padding-right: ${withProp('theme.spacing.unit', (spacing) => `${spacing * 2}px`)};
    }
  }
  @media (max-width: ${prop('theme.breakpoints.md')}) {
    & > div:last-child > div {
      padding-right: ${prop('theme.spacing.unit')};
    }
  }
`;

interface ColumnType {
  readonly name: string;
  readonly values: ReadonlyArray<string | React.ReactElement>;
  readonly numeric?: boolean;
  readonly visibleAt?: string;
  readonly minWidth?: boolean;
}

interface Props {
  readonly getRowHeight?: (idx: number) => number | undefined;
  readonly columns: readonly ColumnType[];
}

export const Table = ({ columns, getRowHeight }: Props) => (
  <Root>
    {columns.map((col, idx) => (
      <Column
        key={col.name}
        name={col.name}
        values={col.values}
        numeric={col.numeric}
        visibleAt={col.visibleAt}
        firstCol={idx === 0}
        minWidth={col.minWidth}
        getRowHeight={getRowHeight}
      />
    ))}
  </Root>
);
