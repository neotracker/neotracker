export interface Theme {
  readonly primary: string;
  readonly secondary: string;
}

export const createTheme = (): Theme => ({
  primary: 'blue',
  secondary: 'green',
});
