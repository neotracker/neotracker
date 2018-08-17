import * as React from 'react';
import * as CSS from 'csstype';
import { StyledComponentClass, ThemedStyledFunction, ThemedOuterStyledProps } from 'styled-components';

export interface CSSProperties extends CSS.StandardProperties<string | number> {}

type AsSingle = keyof JSX.IntrinsicElements | React.ComponentType<any> | AsComponent<any, any>;
type AsTuple = AsSingle[];
type As = AsSingle | AsTuple;
type TupledAs<A extends As> = A extends AsSingle ? [A] : A extends AsSingle[] ? A : never;
type ConcatAs<A1 extends As, A2 extends As> = Concat<TupledAs<A1>, TupledAs<A2>>;
export type AsSingleProps<A> = A extends AsComponent<infer A1, infer P1>
  ? AsProps<TupledAs<A1>, P1>
  : A extends React.ComponentType<infer P>
    ? P
    : A extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[A] : never;

type AsProps<A extends any[], B = {}> = {
  0: B;
  1: AsProps1<A> & B;
  2: AsProps<Drop2<A>, AsProps2<A> & B>;
  4: AsProps<Drop4<A>, AsProps4<A> & B>;
  8: AsProps<Drop8<A>, AsProps8<A> & B>;
}[Measure<A['length']>];
type WithCSSProperties<P> = P & Omit<CSSProperties, keyof P>;
export type AsComponentPropsBase<A extends As, P> = WithCSSProperties<P> &
  AsProps<TupledAs<A>> & { children?: React.ReactNode };
type AsComponentProps<A extends As, P> = { as?: A } & AsComponentPropsBase<A, P>;
interface AsComponent<A extends As, P> {
  <NewA extends As>(props: AsComponentProps<NewA, P> & AsProps<TupledAs<A>>): React.ReactElement<any> | null;
  (props: AsComponentPropsBase<A, P>): React.ReactElement<any> | null;
  readonly as: <NewA extends As>(a: NewA) => AsComponent<ConcatAs<NewA, A>, P>;
}
export type AProps<C extends AsComponent<any, any>> = C extends AsComponent<infer A, infer P>
  ? AsComponentProps<A, P>
  : never;

type AsProps1<T extends any[]> = ((..._: T) => 0) extends ((a0: infer A0, ..._: any[]) => 0)
  ? AsSingleProps<A0>
  : never;
type AsProps2<T extends AsTuple> = ((..._: T) => 0) extends ((a0: infer A0, a1: infer A1, ..._: any[]) => 0)
  ? AsSingleProps<A0> & AsSingleProps<A1>
  : never;
type AsProps4<T extends AsTuple> = ((..._: T) => 0) extends ((
  a0: infer A0,
  a1: infer A1,
  a2: infer A2,
  a3: infer A3,
  ..._: any[]
) => 0)
  ? AsSingleProps<A0> & AsSingleProps<A1> & AsSingleProps<A2> & AsSingleProps<A3>
  : never;
type AsProps8<T extends AsTuple> = ((..._: T) => 0) extends ((
  a0: infer A0,
  a1: infer A1,
  a2: infer A2,
  a3: infer A3,
  a4: infer A4,
  a5: infer A5,
  a6: infer A6,
  a7: infer A7,
  ..._: any[]
) => 0)
  ? AsSingleProps<A0> &
      AsSingleProps<A1> &
      AsSingleProps<A2> &
      AsSingleProps<A3> &
      AsSingleProps<A4> &
      AsSingleProps<A5> &
      AsSingleProps<A6> &
      AsSingleProps<A7>
  : never;

export interface BaseProps {
  static?: boolean;
  absolute?: boolean;
  fixed?: boolean;
  relative?: boolean;
  sticky?: boolean;
}
export interface Base<A extends As = 'div'> extends AsComponent<A, BaseProps> {}
export const Base: Base;

export interface BlockProps {}
export interface Block<A extends As = 'div'> extends AsComponent<Base<A>, BlockProps> {}
export const Block: Block;

export interface BoxProps {}
export interface Box<A extends As = 'div'> extends AsComponent<Base<A>, BoxProps> {}
export const Box: Box;

export interface FlexProps {
  readonly row?: boolean;
  readonly column?: boolean;
  readonly rowReverse?: boolean;
  readonly columnReverse?: boolean;
  readonly nowrap?: boolean;
  readonly wrap?: boolean;
  readonly wrapReverse?: boolean;
}
export interface Flex<A extends As = 'div'> extends AsComponent<Base<A>, FlexProps> {}
export const Flex: Flex;

export interface InlineProps {}
export interface Inline<A extends As = 'div'> extends AsComponent<Base<A>, InlineProps> {}
export const Inline: Inline;

export interface InlineBlockProps {}
export interface InlineBlock<A extends As = 'div'> extends AsComponent<Base<A>, InlineBlockProps> {}
export const InlineBlock: InlineBlock;

export interface InlineFlexProps {
  readonly row?: boolean;
  readonly column?: boolean;
  readonly rowReverse?: boolean;
  readonly columnReverse?: boolean;
  readonly nowrap?: boolean;
  readonly wrap?: boolean;
  readonly wrapReverse?: boolean;
}
export interface InlineFlex<A extends As = 'div'> extends AsComponent<Base<A>, InlineFlexProps> {}
export const InlineFlex: InlineFlex;

export interface ArrowProps {
  readonly angle?: number;
}
export interface Arrow<A extends As = 'div'> extends AsComponent<Base<A>, ArrowProps> {}
export const Arrow: Arrow;

export interface BackdropProps {}
export interface Backdrop<A extends As = 'div'> extends AsComponent<ConcatAs<Hidden, A>, BackdropProps> {}
export const Backdrop: Backdrop;

export interface BlockquoteProps {}
export interface Blockquote<A extends As = 'blockquote'> extends AsComponent<Base<A>, BlockquoteProps> {}
export const Blockquote: Blockquote;

export interface ButtonProps {}
export interface Button<A extends As = 'div'> extends AsComponent<Base<A>, ButtonProps> {}
export const Button: Button;

export interface CardProps {}
export interface Card<A extends As = 'div'> extends AsComponent<Base<A>, CardProps> {}
export const Card: Card;

export interface CodeProps {
  readonly block?: boolean;
  readonly codeClassName?: string;
}
export interface Code<A extends As = 'pre'> extends AsComponent<Base<A>, CodeProps> {}
export const Code: Code;

export interface FieldProps {}
export interface Field<A extends As = 'div'> extends AsComponent<Base<A>, FieldProps> {}
export const Field: Field;

export interface FitProps {}
export interface Fit<A extends As = 'div'> extends AsComponent<Base<A>, FitProps> {}
export const Fit: Fit;

export interface GridItemProps {
  readonly area?: string | number;
  readonly column?: string | number;
  readonly row?: string | number;
  readonly columnStart?: string | number;
  readonly columnEnd?: string | number;
  readonly rowStart?: string | number;
  readonly rowEnd?: string | number;
}
export interface GridItem<A extends As = 'div'> extends AsComponent<Base<A>, GridItemProps> {}

export interface GridProps {
  readonly row?: boolean;
  readonly column?: boolean;
  readonly dense?: boolean;
  readonly gap?: string | number;
  readonly areas?: string | number;
  readonly columns?: string | number;
  readonly rows?: string | number;
  readonly autoColumns?: string | number;
  readonly autoRows?: string | number;
}
export interface Grid<A extends As = 'div'> extends AsComponent<Base<A>, GridProps> {
  readonly Item: GridItem;
}
export const Grid: Grid;

export interface GroupItemProps {}
export interface GroupItem<A extends As = 'div'> extends AsComponent<Box<A>, GroupItemProps> {}

export interface GroupProps {
  readonly vertical?: boolean;
  readonly verticalAt?: boolean;
}
export interface Group<A extends As = 'div'> extends AsComponent<Base<A>, GroupProps> {
  readonly Item: GroupItem;
}
export const Group: Group;

export interface HeadingProps {}
export interface Heading<A extends As = 'h1'> extends AsComponent<Base<A>, HeadingProps> {}
export const Heading: Heading;

export interface HiddenContainerProps {
  readonly initialState?: {
    readonly visible: boolean;
  };
  readonly children?: (
    props: {
      readonly visible: boolean;
      readonly toggle: () => void;
      readonly show: () => void;
      readonly hide: () => void;
    },
  ) => void;
}
export interface HiddenContainer extends React.ComponentClass<HiddenContainerProps> {}

export interface HiddenHideProps {
  readonly hide: () => void;
}
export interface HiddenHide<A extends As = 'button'> extends AsComponent<Base<A>, HiddenHideProps> {}

export interface HiddenShowProps {
  readonly show: () => void;
}
export interface HiddenShow<A extends As = 'button'> extends AsComponent<Base<A>, HiddenShowProps> {}

export interface HiddenToggleProps {
  readonly toggle: () => void;
}
export interface HiddenToggle<A extends As = 'button'> extends AsComponent<Base<A>, HiddenToggleProps> {}

export interface HiddenProps {
  hide?: () => void;
  hideOnEsc?: boolean;
  visible?: boolean;
  destroy?: boolean;
  styleProp?: 'display' | 'visibility' | 'opacity';
}
export interface Hidden<A extends As = 'div'> extends AsComponent<Base<A>, HiddenProps> {
  readonly Container: HiddenContainer;
  readonly Hide: HiddenHide;
  readonly Show: HiddenShow;
  readonly Toggle: HiddenToggleProps;
}
export const Hidden: Hidden;

export interface ImageProps {}
export interface Image<A extends As = 'img'> extends AsComponent<Base<A>, ImageProps> {}
export const Image: Image;

export interface InputProps {}
export interface Input<A extends As = 'input'> extends AsComponent<Box<A>, InputProps> {}
export const Input: Input;

export interface LabelProps {}
export interface Label<A extends As = 'div'> extends AsComponent<Base<A>, LabelProps> {}
export const Label: Label;

export interface LinkProps {}
export interface Link<A extends As = 'a'> extends AsComponent<Base<A>, LinkProps> {}
export const Link: Link;

export interface ListItemProps {}
export interface ListItem<A extends As = 'li'> extends AsComponent<Base<A>, ListItemProps> {}

export interface ListProps {}
export interface List<A extends As = 'ul'> extends AsComponent<Base<A>, ListProps> {
  readonly Item: ListItem;
}
export const List: List;

export interface NavigationProps {}
export interface Navigation<A extends As = 'nav'> extends AsComponent<Base<A>, NavigationProps> {}
export const Navigation: Navigation;

export interface OverlayContainerProps extends HiddenContainerProps {}
export interface OverlayContainer extends React.ComponentClass<OverlayContainerProps> {}

export interface OverlayHideProps {}
export interface OverlayHide<A extends As = 'button'> extends AsComponent<HiddenHide<A>, OverlayHideProps> {}

export interface OverlayShowProps {}
export interface OverlayShow<A extends As = 'button'> extends AsComponent<HiddenShow<A>, OverlayShowProps> {}

export interface OverlayToggleProps {}
export interface OverlayToggle<A extends As = 'button'> extends AsComponent<HiddenToggle<A>, OverlayToggleProps> {}

export interface OverlayProps {}
export interface Overlay<A extends As = 'div'> extends AsComponent<Hidden<A>, OverlayProps> {
  readonly Container: OverlayContainer;
  readonly Hide: OverlayHide;
  readonly Show: OverlayShow;
  readonly Toggle: OverlayToggleProps;
}
export const Overlay: Overlay;

export interface ParagraphProps {}
export interface Paragraph<A extends As = 'p'> extends AsComponent<Base<A>, ParagraphProps> {}
export const Paragraph: Paragraph;

export interface PerpendicularProps {
  readonly pos?: 'top' | 'right' | 'bottom' | 'left';
  readonly align?: 'start' | 'center' | 'end';
  readonly gutter?: string;
  readonly rotate?: boolean;
  readonly reverse?: boolean;
}
export interface Perpendicular<A extends As = 'div'> extends AsComponent<Base<A>, PerpendicularProps> {}
export const Perpendicular: Perpendicular;

export interface PopoverArrowProps {}
export interface PopoverArrow<A extends As = 'div'>
  extends AsComponent<[Perpendicular, Arrow, Box<A>], NavigationProps> {}

export interface PopoverContainerProps extends HiddenContainerProps {}
export interface PopoverContainer extends React.ComponentClass<PopoverContainerProps> {}

export interface PopoverHideProps {}
export interface PopoverHide<A extends As = 'button'> extends AsComponent<HiddenHide<A>, PopoverHideProps> {}

export interface PopoverShowProps {}
export interface PopoverShow<A extends As = 'button'> extends AsComponent<HiddenShow<A>, PopoverShowProps> {}

export interface PopoverToggleProps {}
export interface PopoverToggle<A extends As = 'button'> extends AsComponent<HiddenToggle<A>, PopoverToggleProps> {}

export interface PopoverProps {
  readonly popoverId?: string;
}
export interface Popover<A extends As = 'div'> extends AsComponent<[Perpendicular, Hidden<A>], OverlayProps> {
  readonly Arrow: PopoverArrow;
  readonly Container: PopoverContainer;
  readonly Hide: PopoverHide;
  readonly Show: PopoverShow;
  readonly Toggle: PopoverToggleProps;
}
export const Popover: Popover;

export interface ShadowProps {
  readonly depth?: number;
}
export interface Shadow<A extends As = 'div'> extends AsComponent<Fit<A>, ShadowProps> {}
export const Shadow: Shadow;

export interface SidebarContainerProps extends OverlayContainerProps {}
export interface SidebarContainer extends React.ComponentClass<SidebarContainerProps> {}

export interface SidebarHideProps {}
export interface SidebarHide<A extends As = 'button'> extends AsComponent<OverlayHide<A>, SidebarHideProps> {}

export interface SidebarShowProps {}
export interface SidebarShow<A extends As = 'button'> extends AsComponent<OverlayShow<A>, SidebarShowProps> {}

export interface SidebarToggleProps {}
export interface SidebarToggle<A extends As = 'button'> extends AsComponent<OverlayToggle<A>, SidebarToggleProps> {}

export interface SidebarProps {
  readonly align?: 'left' | 'right';
}
export interface Sidebar<A extends As = 'div'> extends AsComponent<Hidden<A>, SidebarProps> {
  readonly Container: SidebarContainer;
  readonly Hide: SidebarHide;
  readonly Show: SidebarShow;
  readonly Toggle: SidebarToggleProps;
}
export const Sidebar: Sidebar;

export interface StepContainerProps {
  children: (
    props: {
      readonly loop: boolean;
      readonly ids: Array<number>;
      readonly current: number;
      readonly ordered: object;
      readonly show: () => void;
      readonly hide: () => void;
      readonly toggle: () => void;
      readonly previous: () => void;
      readonly next: () => void;
      readonly reorder: () => void;
      readonly register: (step: string, order: number) => void;
      readonly unregister: (step: string) => void;
      readonly update: (prevStep: string, step: string, order: number) => void;
      readonly getCurrentId: () => number;
      readonly hasPrevious: () => boolean;
      readonly hasNext: () => boolean;
      readonly indexOf: (step: string) => number;
      readonly isCurrent: (step: string) => boolean;
    },
  ) => void;
}
export interface StepContainer extends React.ComponentClass<StepContainerProps> {}

export interface StepHideProps {}
export interface StepHide<A extends As = 'button'> extends AsComponent<OverlayHide<A>, StepHideProps> {}

export interface StepNextProps {
  readonly next: () => void;
  readonly hasNext?: () => boolean;
  readonly loop?: boolean;
}
export interface StepNext<A extends As = 'button'> extends AsComponent<Base<A>, StepNextProps> {}

export interface StepPreviousProps {
  readonly next: () => void;
  readonly hasNext?: () => boolean;
  readonly loop?: boolean;
}
export interface StepPrevious<A extends As = 'button'> extends AsComponent<Base<A>, StepPreviousProps> {}

export interface StepShowProps {}
export interface StepShow<A extends As = 'button'> extends AsComponent<OverlayShow<A>, StepShowProps> {}

export interface StepToggleProps {}
export interface StepToggle<A extends As = 'button'> extends AsComponent<OverlayToggle<A>, StepToggleProps> {}

export interface StepProps {
  readonly step: string;
  readonly current: number;
  readonly register: (step: string, order: number) => void;
  readonly unregister: (step: string) => void;
  readonly update: (prevStep: string, step: string, order: number) => void;
  readonly indexOf: (step: string) => number;
  readonly order?: number;
  readonly onEnter?: (element: React.Ref<any>) => void;
  readonly onExit?: (element: React.Ref<any>) => void;
}
export interface Step<A extends As = 'div'> extends AsComponent<Hidden<A>, StepProps> {
  readonly Container: StepContainer;
  readonly Hide: StepHide;
  readonly Next: StepNext;
  readonly Previous: StepPrevious;
  readonly Show: StepShow;
  readonly Toggle: StepToggleProps;
}
export const Step: Step;

export interface TableBodyProps {}
export interface TableBody<A extends As = 'tbody'> extends AsComponent<Base<A>, TableBodyProps> {}

export interface TableCaptionProps {}
export interface TableCaption<A extends As = 'caption'> extends AsComponent<Base<A>, TableCaptionProps> {}

export interface TableCellProps {
  readonly header?: boolean;
}
export interface TableCell<A extends As = 'td'> extends AsComponent<Base<A>, TableCellProps> {}

export interface TableColumnProps {}
export interface TableColumn<A extends As = 'col'> extends AsComponent<Base<A>, TableColumnProps> {}

export interface TableColumnGroupProps {}
export interface TableColumnGroup<A extends As = 'colgroup'> extends AsComponent<Base<A>, TableColumnGroupProps> {}

export interface TableFootProps {}
export interface TableFoot<A extends As = 'tfoot'> extends AsComponent<Base<A>, TableFootProps> {}

export interface TableHeadProps {}
export interface TableHead<A extends As = 'thead'> extends AsComponent<Base<A>, TableHeadProps> {}

export interface TableRowProps {}
export interface TableRow<A extends As = 'tr'> extends AsComponent<Base<A>, TableRowProps> {}

export interface TableProps {}
export interface Table<A extends As = 'table'> extends AsComponent<Base<A>, TableProps> {
  readonly Body: TableBody;
  readonly Caption: TableCaption;
  readonly Cell: TableCell;
  readonly Column: TableColumn;
  readonly ColumnGroup: TableColumnGroup;
  readonly Foot: TableFoot;
  readonly Head: TableHead;
  readonly Row: TableRow;
}
export const Table: Table;

export interface TabsContainerProps {
  children: (
    props: {
      readonly loop: boolean;
      readonly ids: Array<number>;
      readonly current: number;
      readonly ordered: object;
      readonly show: () => void;
      readonly hide: () => void;
      readonly toggle: () => void;
      readonly previous: () => void;
      readonly next: () => void;
      readonly reorder: () => void;
      readonly register: (step: string, order: number) => void;
      readonly unregister: (step: string) => void;
      readonly update: (prevStep: string, step: string, order: number) => void;
      readonly getCurrentId: () => number;
      readonly hasPrevious: () => boolean;
      readonly hasNext: () => boolean;
      readonly indexOf: (step: string) => number;
      readonly isCurrent: (step: string) => boolean;
    },
  ) => void;
}
export interface TabsContainer extends React.ComponentClass<TabsContainerProps> {}

export interface TabsNextProps {}
export interface TabsNext<A extends As = 'button'> extends AsComponent<StepNext<A>, TabsNextProps> {}

export interface TabsPanelProps {
  readonly tab: string;
  readonly isCurrent: (step: string) => boolean;
}
export interface TabsPanel<A extends As = 'div'> extends AsComponent<Hidden<A>, TabsPanelProps> {}

export interface TabsPreviousProps {}
export interface TabsPrevious<A extends As = 'button'> extends AsComponent<StepPrevious<A>, TabsPreviousProps> {}

export interface TabsTabProps {
  readonly tab: string;
  readonly register: (step: string, order: number) => void;
  readonly update: (prevStep: string, step: string, order: number) => void;
  readonly unregister: (step: string) => void;
  readonly isCurrent: (step: string) => boolean;
  readonly show: () => void;
  readonly next: () => void;
  readonly previous: () => void;
  readonly disabled?: boolean;
}
export interface TabsTab<A extends As = 'li'> extends AsComponent<'li', TabsTabProps> {}

export interface TabsProps {}
export interface Tabs<A extends As = 'ul'> extends AsComponent<Base<A>, TabsProps> {
  readonly Container: TabsContainer;
  readonly Next: TabsNext;
  readonly Panel: TabsPanel;
  readonly Previous: TabsPrevious;
  readonly Tab: TabsTab;
}
export const Tabs: Tabs;

export interface TooltipArrowProps {}
export interface TooltipArrow<A extends As = 'div'> extends AsComponent<Perpendicular<Base<A>>, TooltipArrowProps> {}

export interface TooltipProps {
  readonly pos?: 'top' | 'right' | 'bottom' | 'left';
  readonly align?: 'start' | 'center' | 'end';
  readonly alignOffset?: string | number;
  readonly gutter?: string | number;
  readonly rotate?: boolean;
  readonly angle?: boolean;
}
export interface Tooltip<A extends As = 'div'> extends AsComponent<Perpendicular<A>, TooltipProps> {
  readonly Arrow: TooltipArrow;
}
export const Tooltip: Tooltip;

export function as<NewA extends As>(
  as: NewA,
): <A extends As, P, C extends AsComponent<A, P>>(component: C) => AsComponent<ConcatAs<NewA, A>, P>;

export interface CActions<State> {
  [action: string]: (...payload: any[]) => (state: State) => Partial<State>;
}
export type ContainerActionProps<State, Actions extends CActions<State>> = {
  [K in keyof Actions]: (...payload: any[]) => void
};
export interface StateWithSetState<State> {
  readonly state: State;
  readonly setState: (state: Partial<State>) => void;
}
export interface CEffects<State> {
  [effect: string]: (...payload: any[]) => (state: StateWithSetState<State>) => void;
}
export type ContainerEffectProps<State, Actions extends CEffects<State>> = {
  [K in keyof Actions]: (...payload: any[]) => void
};
export type ContainerChildrenProps<State, Actions extends CActions<State>, Effects extends CEffects<State>> = State &
  ContainerActionProps<State, Actions> &
  ContainerEffectProps<State, Effects>;
export type ContainerChildren<State, Actions extends CActions<State>, Effects extends CEffects<State>> = (
  props: ContainerChildrenProps<State, Actions, Effects>,
) => React.ReactNode;
export interface ContainerProps<State, Actions extends CActions<State>, Effects extends CEffects<State>> {
  readonly initialState: State;
  readonly actions?: Actions;
  readonly effects?: Effects;
  readonly children?: ContainerChildren<State, Actions, Effects>;
  readonly onMount?: (options: StateWithSetState<State>) => void;
  readonly onUpdate?: (
    options: StateWithSetState<State> & {
      prevState: State;
      type: 'onMount' | 'onUpdate' | 'onUnmount' | keyof Actions | keyof Effects;
    },
  ) => void;
  readonly onUnmount?: (options: StateWithSetState<State>) => void;
}
export interface Container<State, Actions extends CActions<State>, Effects extends CEffects<State>> {
  (props: ContainerProps<State, Actions, Effects>): React.ReactElement<any>;
}
export function Container<State, Actions extends CActions<State>, Effects extends CEffects<State>>(
  props: ContainerProps<State, Actions, Effects>,
): React.ReactElement<any>;
