import * as React from 'react';
import { withTheme } from 'styled-components';
import { Theme } from '../../theme';

interface WithThemeProps {
  readonly children: (theme: Theme) => React.ReactNode;
}
interface Props extends WithThemeProps {
  readonly theme: Theme;
}
// tslint:disable-next-line: no-null-undefined-union
const WithThemeComponent = ({ children, theme }: Props) => children(theme);

export type WithTheme = React.ComponentType<WithThemeProps>;
// tslint:disable-next-line no-any
export const WithTheme = (withTheme as any)(WithThemeComponent);
