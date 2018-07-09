// tslint:disable no-any
import { AsComponentClass } from 'reakit';
// tslint:disable-next-line match-default-export-name
import styledComponents, {
  Interpolation,
  StyledComponentClass,
  ThemedStyledFunction,
  ThemedStyledProps,
} from 'styled-components';

import { Theme } from './Theme';

type KeyofBase = keyof any;
type Diff<T extends KeyofBase, U extends KeyofBase> = ({ [P in T]: P } & { [P in U]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
type WithOptionalTheme<P extends { readonly theme?: T }, T> = Omit<P, 'theme'> & { readonly theme?: T };
interface AsThemedStyledFunction<T, P> {
  // tslint:disable-next-line
  <U = {}>(
    strings: TemplateStringsArray,
    // tslint:disable-next-line readonly-array
    ...interpolations: Array<Interpolation<ThemedStyledProps<P & U, T>>>
  ): AsComponentClass<P & U, T>;
}
interface ThemeStyledInterface<T> {
  <P, TTag extends keyof JSX.IntrinsicElements>(tag: TTag): ThemedStyledFunction<P, T, P & JSX.IntrinsicElements[TTag]>;
  <C extends StyledComponentClass<any, any, any> | AsComponentClass<any, any>>(
    component: C,
  ): C extends AsComponentClass<infer P, any>
    ? AsThemedStyledFunction<T, P>
    : C extends StyledComponentClass<infer P2, any, infer O> ? ThemedStyledFunction<P2, T, O> : never;
  <P extends { readonly [prop: string]: any; readonly theme?: T }>(
    component: React.ComponentType<P>,
  ): ThemedStyledFunction<P, T, WithOptionalTheme<P, T>>;
}

export const styled = (styledComponents as any) as ThemeStyledInterface<Theme>;
