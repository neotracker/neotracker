import * as React from 'react';
import { StyledComponentClass, ThemedStyledFunction, ThemedOuterStyledProps } from 'styled-components';

type DefaultTheme = any;
type AsSingle =
  | keyof JSX.IntrinsicElements
  | StyledComponentClass<any, any, any>
  | React.ComponentType<any>
  | AsComponentClass<any, any>;
type As = AsSingle | AsSingle[];

export interface AsComponentClass<P, T = DefaultTheme>
  extends StyledComponentClass<P & React.AllHTMLAttributes<EventTarget>, T> {
  readonly as: <NewP = {}>(value: As) => AsComponentClass<P & NewP, T>;
}

export interface ArrowProps extends BaseProps {
  angle?: number;
}
export const Arrow: AsComponentClass<ArrowProps>;

export interface BackdropProps extends HiddenProps {}
export const Backdrop: AsComponentClass<BackdropProps>;

export interface BaseProps {
  static?: boolean;
  absolute?: boolean;
  fixed?: boolean;
  relative?: boolean;
  sticky?: boolean;
}
export const Base: AsComponentClass<BaseProps>;

export interface BlockProps extends BaseProps {}
export const Block: AsComponentClass<BlockProps>;

export interface BlockquoteProps extends BaseProps {}
export const Blockquote: AsComponentClass<BlockquoteProps>;

export interface BoxProps extends BaseProps {}
export const Box: AsComponentClass<BoxProps>;

export interface HiddenProps extends BaseProps {
  hide?: () => void;
  hideOnEsc?: boolean;
  visible?: boolean;
  destroy?: boolean;
  styleProp?: 'display' | 'visibility' | 'opacity';
}
export const Hidden: AsComponentClass<HiddenProps>;

export function as<NewP = {}, T = DefaultTheme>(
  asComponents: As,
): <P>(
  WrappedComponent: React.ComponentClass<P> | StyledComponentClass<P, T> | AsComponentClass<P, T>,
) => AsComponentClass<P & NewP, T>;
