// tslint:disable no-any array-type readonly-array readonly-keyword
import { As, AsComponent, AsComponentProps } from 'reakit';
// tslint:disable-next-line match-default-export-name
import styledComponents, { StyledComponentClass, ThemedStyledFunction, ThemedStyledProps } from 'styled-components';

import { Theme } from './Theme';

type WithOptionalTheme<P extends { readonly theme?: T }, T> = Omit<P, 'theme'> & { readonly theme?: T };

export type FalseyValue = undefined | null | false;
export type Interpolation<P> =
  | FlattenInterpolation<P>
  | ReadonlyArray<FlattenInterpolation<P> | ReadonlyArray<FlattenInterpolation<P>>>;
export type FlattenInterpolation<P> = InterpolationValue | InterpolationFunction<P>;
export type InterpolationValue =
  | string
  | number
  | Styles
  | FalseyValue
  | StyledComponentClass<any, any>
  | AsComponent<any, any>;
export type SimpleInterpolation =
  | InterpolationValue
  | ReadonlyArray<InterpolationValue | ReadonlyArray<InterpolationValue>>;
export interface Styles {
  [ruleOrSelector: string]: string | number | Styles;
}
export type InterpolationFunction<P> = (props: P) => Interpolation<P>;

export type AsThemedStyledFunction<A extends As, P> = <U = {}>(
  strings: TemplateStringsArray,
  ...interpolations: Interpolation<ThemedStyledProps<AsComponentProps<A, P> & U, Theme>>[]
) => AsComponent<A, P & U>;

interface ThemeStyledInterface {
  <P, TTag extends keyof JSX.IntrinsicElements>(tag: TTag): ThemedStyledFunction<
    P,
    Theme,
    P & JSX.IntrinsicElements[TTag]
  >;
  <C extends StyledComponentClass<any, any, any> | AsComponent<any, any>>(component: C): C extends AsComponent<
    infer A1,
    infer P1
  >
    ? AsThemedStyledFunction<A1, P1>
    : C extends StyledComponentClass<infer P2, any, infer O2> ? ThemedStyledFunction<P2, Theme, O2> : {};
  <P extends { readonly [prop: string]: any; readonly theme?: Theme }>(
    component: React.ComponentType<P>,
  ): ThemedStyledFunction<P, Theme, WithOptionalTheme<P, Theme>>;
}

export const styled = (styledComponents as any) as ThemeStyledInterface;
