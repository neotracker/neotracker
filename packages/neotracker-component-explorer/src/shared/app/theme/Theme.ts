// tslint:disable no-any
import { css as styledCss, ThemedCssFunction } from 'styled-components';

export interface Theme {
  readonly primary: string;
  readonly secondary: string;
  readonly pinkLight: string;
  readonly pink: string;
  readonly pinkDark: string;
  readonly black: string;
  readonly grayLightest: string;
  readonly grayLighter: string;
  readonly grayLight: string;
  readonly gray: string;
  readonly grayDark: string;
  readonly lightGreen: string;
  readonly deepPurple: string;
  readonly indigoLight: string;
  readonly greenLight: string;
  readonly identifier: string;
  readonly type: string;

  readonly Button: ReturnType<typeof css>;
  readonly Code: ReturnType<typeof css>;
  readonly Heading: ReturnType<typeof css>;
  readonly Link: ReturnType<typeof css>;
  readonly Table: ReturnType<typeof css>;
}

export const css = styledCss as ThemedCssFunction<Theme>;

export const theme: Theme = {
  primary: '#8BC34A',
  secondary: '#673AB7',
  pinkLight: '#fd88ce',
  pink: '#fd6099',
  pinkDark: '#fc4577',
  black: '#282b36',
  grayLightest: '#eee',
  grayLighter: '#ccc',
  grayLight: '#999',
  gray: '#666',
  grayDark: '#333',
  lightGreen: '#8BC34A',
  deepPurple: '#673AB7',
  indigoLight: '#3D5AFE',
  greenLight: '#00C853',
  identifier: '#039BE5',
  type: '#EF6C00',

  Button: css`
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #444;
  `,

  Code: css`
    font-family: 'Fira Code', monospace;
    font-size: 14px;
    white-space: pre;
    overflow: auto;
    code {
      font-family: inherit;
    }
  `,

  Heading: css`
    line-height: 1.15;
    letter-spacing: -0.015em;
  `,

  Link: css`
    color: ${({ theme: t }: any) => t.pinkDark};
    font-weight: 600;
  `,

  Table: css`
    table-layout: auto;
    border: 0;
    width: 100%;
    margin-bottom: 1em;
    td {
      vertical-align: top;
      padding: 0.5em;
    }
    th {
      padding: 0.5em;
      text-align: left;
      background-color: white;
    }
    tr:nth-child(odd) {
      background-color: #f6f6f6;
    }
  `,
};
