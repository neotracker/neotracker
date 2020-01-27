/* @flow */
/* eslint-disable */

declare type MUI$BaseProps = {|
  'aria-owns'?: ?string,
  'aria-haspopup'?: ?string,
  'aria-label'?: ?string,
  id?: ?string,
|};

declare module '@material-ui/core/AppBar' {
  declare export type Color = 'inherit' | 'primary' | 'secondary' | 'default';
  declare export type Position = 'fixed' | 'absolute' | 'sticky' | 'static';

  declare export type AppBarClasses = {|
    root?: Object,
    positionFixed?: Object,
    positionAbsolute?: Object,
    positionSticky?: Object,
    positionStatic?: Object,
    colorDefault?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
  |};
  declare export type AppBarProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: AppBarClasses,
    color?: Color,
    position?: Position
  |};

  declare var AppBar: React$ComponentType<AppBarProps>;
  declare export default typeof AppBar;
}

declare module '@material-ui/core/Avatar' {
  declare export type AvatarClasses = {|
    root?: Object,
    colorDefault?: Object,
    img?: Object,
  |};
  declare export type AvatarProps = {|
    ...MUI$BaseProps,
    alt?: string,
    children?: string | React$Element<any>,
    className?: string,
    classes?: AvatarClasses,
    component?: React$ElementType,
    imgProps?: Object,
    sizes?: string,
    src?: string,
    srcSet?: string
  |};

  declare var Avatar: React$ComponentType<AvatarProps>;
  declare export default typeof Avatar;
}

declare module '@material-ui/core/Backdrop' {
  import type { TransitionDuration } from '@material-ui/core/internal/transition';

  declare export type BackdropClasses = {|
    root?: Object,
    invisible?: Object,
  |};
  declare export type BackdropProps = {|
    ...MUI$BaseProps,
    className?: string,
    classes?: BackdropClasses,
    invisible?: boolean,
    open: boolean,
    transitionDuration?: TransitionDuration,
  |};

  declare var Backdrop: React$ComponentType<BackdropProps>;
  declare export default typeof Backdrop;
}

declare module '@material-ui/core/Badge' {
  declare export type Color = 'default' | 'primary' | 'secondary';

  declare export type BadgeClasses = {|
    root?: Object,
    badge?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    colorError?: Object,
  |};
  declare export type BadgeProps = {|
    ...MUI$BaseProps,
    badgeContent: React$Node,
    children: React$Node,
    className?: string,
    classes?: BadgeClasses,
    color?: Color,
    component?: React$ElementType,
  |};

  declare var Badge: React$ComponentType<BadgeProps>;
  declare export default typeof Badge;
}

declare module '@material-ui/core/BottomNavigation' {
  declare export type BottomNavigationClasses = {|
    root?: Object,
  |};
  declare export type BottomNavigationProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: BottomNavigationClasses,
    onChange?: Function,
    showLabels?: boolean,
    value: any
  |};

  declare var BottomNavigation: React$ComponentType<BottomNavigationProps>;
  declare export default typeof BottomNavigation;
}

declare module '@material-ui/core/BottomNavigationAction' {
  import type { ButtonBaseProps } from '@material-ui/core/ButtonBase';
  declare export type BottomNavigationActionClasses = {|
    root?: Object,
    selected?: Object,
    selectedIconOnly?: Object,
    wrapper?: Object,
    label?: Object,
    selectedLabel?: Object,
    hiddenLabel?: Object,
  |};
  declare export type BottomNavigationActionProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    className?: string,
    classes?: BottomNavigationActionClasses,
    icon?: React$Node,
    label?: React$Node,
    showLabel?: boolean,
    value?: any
  |};
  declare var BottomNavigationAction: React$ComponentType<BottomNavigationActionProps>;
  declare export default typeof BottomNavigationAction;
}

declare module '@material-ui/core/Button' {
  import type { ButtonBaseProps } from '@material-ui/core/ButtonBase';
  declare export type Color = 'default' | 'inherit' | 'primary' | 'secondary';
  declare export type ButtonSize = 'small' | 'medium' | 'large';
  declare export type ButtonVariant = 'flat' | 'contained' | 'fab';

  declare export type ButtonClasses = {|
    root?: Object,
    label?: Object,
    flatPrimary?: Object,
    flatSecondary?: Object,
    colorInherit?: Object,
    raised?: Object,
    raisedPrimary?: Object,
    raisedSecondary?: Object,
    disabled?: Object,
    fab?: Object,
    mini?: Object,
    sizeSmall?: Object,
    sizeLarge?: Object,
    fullWidth?: Object,
  |};
  declare export type ButtonProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    children: React$Node,
    className?: string,
    classes?: ButtonClasses,
    color?: Color,
    component?: React$ElementType,
    disabled?: boolean,
    disableFocusRipple?: boolean,
    disableRipple?: boolean,
    fullWidth?: boolean,
    href?: string,
    mini?: boolean,
    size?: ButtonSize,
    variant?: ButtonVariant,
    focusVisibleClassName?: string,
  |};
  declare var Button: React$ComponentType<ButtonProps>;
  declare export default typeof Button;
}

declare module '@material-ui/core/ButtonBase' {
  declare export type ButtonBaseClasses = {|
    root?: Object,
    disabled?: Object,
  |};
  declare export type ButtonBaseProps = {|
    ...MUI$BaseProps,
    buttonRef?: React$Ref<>,
    centerRipple?: boolean,
    children?: React$Node,
    className?: string,
    classes?: ButtonBaseClasses,
    component?: React$ElementType,
    disabled?: boolean,
    disableRipple?: boolean,
    focusRipple?: boolean,
    onFocusVisible?: (event: SyntheticEvent<>) => void,

    onBlur?: (event: SyntheticEvent<>) => void,
    onClick?: (event: SyntheticEvent<>) => void,
    onFocus?: (event: SyntheticEvent<>) => void,
    onKeyDown?: (event: SyntheticEvent<>) => void,
    onKeyUp?: (event: SyntheticEvent<>) => void,
    onMouseDown?: (event: SyntheticEvent<>) => void,
    onMouseLeave?: (event: SyntheticEvent<>) => void,
    onMouseUp?: (event: SyntheticEvent<>) => void,
    onTouchEnd?: (event: SyntheticEvent<>) => void,
    onTouchMove?: (event: SyntheticEvent<>) => void,
    onTouchStart?: (event: SyntheticEvent<>) => void,
    role?: string,
    tabIndex?: number | string,
  |};

  declare var ButtonBase: React$ComponentType<ButtonBaseProps>;
  declare export default typeof ButtonBase;
}

declare module '@material-ui/core/ButtonBase/createRippleHandler' {
  declare function handleEvent(event: SyntheticUIEvent<>): void;
  declare module.exports: (
    instance: Object,
    eventName: string,
    action: string,
    cb: ?Function
  ) => typeof handleEvent;
}

declare module '@material-ui/core/ButtonBase/Ripple' {
  declare module.exports: React$ComponentType<{|
    className?: string,
    classes?: Object,
    pulsate?: boolean,
    rippleSize: number,
    rippleX: number,
    rippleY: number
  |}>;
}

declare module '@material-ui/core/ButtonBase/TouchRipple' {
  declare module.exports: React$ComponentType<{|
    center?: boolean,
    className?: string,
    classes?: Object
  |}>;
}

declare module '@material-ui/core/Card' {
  declare export type CardProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    raised?: boolean
  |};
  declare var Card: React$ComponentType<CardProps>;
  declare export default typeof Card;
}

declare module '@material-ui/core/CardActions' {
  declare export type CardActionsClasses = {|
    root?: Object,
    action?: Object,
  |};
  declare export type CardActionsProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: CardActionsClasses,
    disableActionSpacing?: boolean
  |};
  declare var CardActions: React$ComponentType<CardActionsProps>;
  declare export default typeof CardActions;
}

declare module '@material-ui/core/CardContent' {
  declare export type CardContentClasses = {|
    root?: Object,
  |};
  declare export type CardContentProps = {|
    ...MUI$BaseProps,
    className?: string,
    classes?: CardContentClasses,
    component?: React$ElementType,
  |};
  declare var CardContent: React$ComponentType<CardContentProps>;
  declare export default typeof CardContent;
}

declare module '@material-ui/core/CardHeader' {
  declare export type CardHeaderClasses = {|
    root?: Object,
    avatar?: Object,
    action?: Object,
    content?: Object,
    title?: Object,
    subheader?: Object,
  |};
  declare export type CardHeaderProps = {|
    ...MUI$BaseProps,
    action?: React$Node,
    avatar?: React$Node,
    className?: string,
    classes?: CardHeaderClasses,
    component?: React$ElementType,
    subheader?: React$Node,
    title?: React$Node
  |};
  declare var CardHeader: React$ComponentType<CardHeaderProps>;
  declare export default typeof CardHeader;
}

declare module '@material-ui/core/CardMedia' {
  declare export type CardMediaClasses = {|
    root?: Object,
    rootMedia?: Object,
  |};
  declare export type CardMediaProps = {|
    ...MUI$BaseProps,
    className?: string,
    classes?: CardMediaClasses,
    component?: React$ElementType,
    image?: string,
    src?: string,
  |};
  declare var CardMedia: React$ComponentType<CardMediaProps>;
  declare export default typeof CardMedia;
}

declare module '@material-ui/core/Checkbox' {
  declare export type Color = 'primary' | 'secondary';
  declare export type CheckboxClasses = {|
    default?: Object,
    checked?: Object,
    checkedPrimary?: Object,
    checkedSecondary?: Object,
    disabled?: Object,
  |};
  declare export type CheckboxProps = {|
    ...MUI$BaseProps,
    checked?: boolean | string,
    checkedIcon?: React$Node,
    className?: string,
    classes?: CheckboxClasses,
    color?: Color,
    disabled?: boolean,
    disableRipple?: boolean,
    icon?: React$Node,
    id?: string,
    indeterminate?: boolean,
    indeterminateIcon?: React$Node,
    inputProps?: Object,
    inputRef?: React$Ref<>,
    name?: string,
    onChange?: (event: SyntheticEvent<>, checked: boolean) => void,
    type?: string,
    value?: string,

    tabIndex?: number | string,
  |};
  declare var Checkbox: React$ComponentType<CheckboxProps>;
  declare export default typeof Checkbox;
}

declare module '@material-ui/core/Chip' {
  import typeof Avatar from '@material-ui/core/Avatar';

  declare export type ChipClasses = {|
    root?: Object,
    clickable?: Object,
    deletable?: Object,
    avatar?: Object,
    avatarChildren?: Object,
    label?: Object,
    deleteIcon?: Object,
  |};
  declare export type ChipProps = {|
    ...MUI$BaseProps,
    avatar?: React$Element<Avatar>,
    className?: string,
    classes?: ChipClasses,
    component?: React$ElementType,
    deleteIcon?: React$Element<any>,
    label?: React$Element<>,
    onDelete?: (event: SyntheticEvent<>) => void,

    onClick?: (event: SyntheticEvent<>) => void,
    onKeyDown?: (event: SyntheticEvent<>) => void,
    tabIndex?: number | string,
  |};
  declare var Chip: React$ComponentType<ChipProps>;
  declare export default typeof Chip;
}

declare module '@material-ui/core/colors/amber' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/blue' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/blueGrey' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/brown' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/common' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/cyan' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/deepOrange' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/deepPurple' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/green' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/grey' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/indigo' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/lightBlue' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/lightGreen' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/lime' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/orange' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/pink' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/purple' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/red' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/teal' {
  declare module.exports: any;
}

declare module '@material-ui/core/colors/yellow' {
  declare module.exports: any;
}

declare module '@material-ui/core/Dialog' {
  import type { PaperProps } from '@material-ui/core/Paper';
  import type {
    TransitionCallback,
    TransitionDuration
  } from '@material-ui/core/internal/transition';
  declare export type MaxWidth = 'xs' | 'sm' | 'md' | false;

  declare export type DialogClasses = {|
    root?: Object,
    paper?: Object,
    paperWidthXs?: Object,
    paperWidthSm?: Object,
    paperWidthMd?: Object,
    fullWidth?: Object,
    fullScreen?: Object,
  |};
  declare export type DialogProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: DialogClasses,
    disableBackdropClick?: boolean,
    disableEscapeKeyDown?: boolean,
    fullScreen?: boolean,
    fullWidth?: boolean,
    maxWidth?: MaxWidth,
    onBackdropClick?: (event: SyntheticEvent<>) => void,
    onClose?: (event: SyntheticEvent<>) => void,
    onEnter?: TransitionCallback,
    onEntered?: TransitionCallback,
    onEntering?: TransitionCallback,
    onEscapeKeyDown?: (event: SyntheticEvent<>) => void,
    onExit?: TransitionCallback,
    onExited?: TransitionCallback,
    onExiting?: TransitionCallback,
    open: boolean,
    PaperProps?: PaperProps,
    TransitionComponent?: React$ComponentType<*>,
    transitionDuration?: TransitionDuration
  |};

  declare var Dialog: React$ComponentType<DialogProps>;
  declare export default typeof Dialog;
}

declare module '@material-ui/core/DialogActions' {
  declare export type DialogActionsClasses = {|
    root?: Object,
    action?: Object,
    button?: Object,
  |};
  declare export type DialogActionsProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: DialogActionsClasses
  |};
  declare var DialogActions: React$ComponentType<DialogActionsProps>;
  declare export default typeof DialogActions;
}

declare module '@material-ui/core/DialogContent' {
  declare export type DialogContentClasses = {|
    root?: Object,
  |};
  declare export type DialogContentProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: DialogContentClasses
  |};
  declare var DialogContent: React$ComponentType<DialogContentProps>;
  declare export default typeof DialogContent;
}

declare module '@material-ui/core/DialogContentText' {
  declare export type DialogContentClasses = {|
    root?: Object,
  |};
  declare export type DialogContentTextProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: DialogContentClasses
  |};
  declare var DialogContentText: React$ComponentType<DialogContentTextProps>;
  declare export default typeof DialogContentText;
}

declare module '@material-ui/core/DialogTitle' {
  declare export type DialogTitleClasses = {|
    root?: Object,
  |};
  declare export type DialogTitleProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: DialogTitleClasses,
    disableTypography?: boolean
  |};
  declare var DialogTitle: React$ComponentType<DialogTitleProps>;
  declare export default typeof DialogTitle;
}

declare module '@material-ui/core/withMobileDialog' {
  declare module.exports: any;
}

declare module '@material-ui/core/Divider' {
  declare export type DividerClasses = {|
    root?: Object,
    inset?: Object,
    default?: Object,
    light?: Object,
    absolute?: Object,
  |};
  declare export type DividerProps = {|
    ...MUI$BaseProps,
    absolute?: boolean,
    className?: string,
    classes?: DividerClasses,
    component?: React$ElementType,
    inset?: boolean,
    light?: boolean
  |};
  declare var Divider: React$ComponentType<DividerProps>;
  declare export default typeof Divider;
}

declare module '@material-ui/core/Drawer' {
  import type { ModalProps } from '@material-ui/core/Modal';
  import type { PaperProps } from '@material-ui/core/Paper';
  import type { SlideProps } from '@material-ui/core/Slide';
  import type { TransitionDuration } from '@material-ui/core/internal/transition';

  declare export type Anchor = 'left' | 'top' | 'right' | 'bottom';
  declare export type Variant = 'permanent' | 'persistent' | 'temporary';

  declare export type DrawerClasses = {|
    docked?: Object,
    paper?: Object,
    paperAnchorLeft?: Object,
    paperAnchorRight?: Object,
    paperAnchorTop?: Object,
    paperAnchorBottom?: Object,
    paperAnchorDockedLeft?: Object,
    paperAnchorDockedTop?: Object,
    paperAnchorDockedRight?: Object,
    paperAnchorDockedBottom?: Object,
    modal?: Object,
  |};
  declare export type DrawerProps = {|
    ...MUI$BaseProps,
    ...ModalProps,
    anchor?: Anchor,
    children?: React$Node,
    className?: string,
    classes?: DrawerClasses,
    elevation?: number,
    ModalProps?: ModalProps,
    onClose?: (event: SyntheticEvent<>) => void,
    open?: boolean,
    PaperProps?: PaperProps,
    SlideProps?: SlideProps,
    transitionDuration?: TransitionDuration,
    variant?: Variant,
  |};
  declare var Drawer: React$ComponentType<DrawerProps>;
  declare export default typeof Drawer;
}

declare module '@material-ui/core/ExpansionPanel' {
  import type { PaperProps } from '@material-ui/core/Paper';
  declare export type ExpansionPanelClasses = {|
    root?: Object,
    expanded?: Object,
    disabled?: Object,
  |};
  declare export type ExpansionPanelProps = {|
    ...MUI$BaseProps,
    ...PaperProps,
    children: React$Node,
    className?: string,
    classes?: ExpansionPanelClasses,
    CollapseProps?: Object,
    defaultExpanded?: boolean,
    disabled?: boolean,
    expanded?: boolean,
    onChange?: (event: SyntheticEvent<>, expanded: boolean) => void,
  |};
  declare var ExpansionPanel: React$ComponentType<ExpansionPanelProps>;
  declare export default typeof ExpansionPanel;
}

declare module '@material-ui/core/ExpansionPanelActions' {
  declare export type ExpansionPanelActionsClasses = {|
    root?: Object,
    action?: Object,
  |};
  declare export type ExpansionPanelActionsProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: ExpansionPanelActionsClasses,
  |};
  declare var ExpansionPanelActions: React$ComponentType<ExpansionPanelActionsProps>;
  declare export default typeof ExpansionPanelActions;
}

declare module '@material-ui/core/ExpansionPanelDetails' {
  declare export type ExpansionPanelDetailsClasses = {|
    root?: Object,
  |};
  declare export type ExpansionPanelDetailsProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: ExpansionPanelDetailsClasses,
  |};
  declare var ExpansionPanelDetails: React$ComponentType<ExpansionPanelDetailsProps>;
  declare export default typeof ExpansionPanelDetails;
}

declare module '@material-ui/core/ExpansionPanelSummary' {
  import type { ButtonBaseProps } from '@material-ui/core/ButtonBase'
  declare export type ExpansionPanelSummaryClasses = {|
    root?: Object,
    expanded?: Object,
    focused?: Object,
    disabled?: Object,
    content?: Object,
    contentExpanded?: Object,
    expandIcon?: Object,
    expandIconExpanded?: Object,
  |};
  declare export type ExpansionPanelSummaryProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    children?: React$Node,
    className?: string,
    classes?: ExpansionPanelSummaryClasses,
    expandIcon?: React$Node,
  |};
  declare var ExpansionPanelSummary: React$ComponentType<ExpansionPanelSummaryProps>;
  declare export default typeof ExpansionPanelSummary;
}

declare module '@material-ui/core/FormControl' {
  declare export type Margin = 'none' | 'dense' | 'normal';

  declare export type FormControlClasses = {|
    root?: Object,
    marginNormal?: Object,
    marginDense?: Object,
    fullWidth?: Object,
  |};
  declare export type FormControlProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: FormControlClasses,
    className?: string,
    component?: React$ElementType,
    disabled?: boolean,
    error?: boolean,
    fullWidth?: boolean,
    margin?: Margin,
    required?: boolean
  |};
  declare var FormControl: React$ComponentType<FormControlProps>;
  declare export default typeof FormControl;
}

declare module '@material-ui/core/FormControlLabel' {
  declare export type FormControlLabelClasses = {|
    root?: Object,
    disabled?: Object,
    label?: Object,
  |};
  declare export type FormControlLabelProps = {|
    ...MUI$BaseProps,
    checked?: boolean | string,
    className?: string,
    classes?: FormControlLabelClasses,
    control: React$Element<any>,
    disabled?: boolean,
    inputRef?: React$Ref<>,
    label?: React$Node,
    name?: string,
    onChange?: (event: SyntheticEvent<>, checked: boolean) => void,
    value?: string
  |};
  declare var FormControlLabel: React$ComponentType<FormControlLabelProps>;
  declare export default typeof FormControlLabel;
}

declare module '@material-ui/core/FormGroup' {
  declare export type FormGroupClasses = {|
    root?: Object,
    row?: Object,
  |};
  declare export type FormGroupProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: FormGroupClasses,
    className?: string,
    row?: boolean
  |};
  declare var FormGroup: React$ComponentType<FormGroupProps>;
  declare export default typeof FormGroup;
}

declare module '@material-ui/core/FormHelperText' {
  declare export type FormHelperTextClasses = {|
    root?: Object,
    dense?: Object,
    error?: Object,
    disabled?: Object,
  |};
  declare export type FormHelperTextProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: FormHelperTextClasses,
    className?: string,
    component?: React$ElementType,
    disabled?: boolean,
    error?: boolean,
    margin?: 'dense',
  |};
  declare var FormHelperText: React$ComponentType<FormHelperTextProps>;
  declare export default typeof FormHelperText;
}

declare module '@material-ui/core/FormLabel' {
  declare export type FormLabelClasses = {|
    root?: Object,
    focused?: Object,
    error?: Object,
    disabled?: Object,
  |};
  declare export type FormLabelProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: FormLabelClasses,
    className?: string,
    component?: React$ElementType,
    disabled?: boolean,
    error?: boolean,
    focused?: boolean,
    required?: boolean,

    // Default component is a "label"
    htmlFor?: string,
  |};
  declare var FormLabel: React$ComponentType<FormLabelProps>;
  declare export default typeof FormLabel;
}

declare module '@material-ui/core/Grid' {
  declare export type GridSizes =
    | boolean
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12;
  declare export type AlignContent =
    | 'stretch'
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around';
  declare export type AlignItems =
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'baseline';
  declare export type Direction = 'row' | 'row-reverse' | 'column' | 'column-reverse';
  declare export type Justify =
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around';
  declare export type Spacing = 0 | 8 | 16 | 24 | 40;
  declare export type Wrap = 'nowrap' | 'wrap' | 'wrap-reverse';

  declare export type GridClasses = {|
    typeContainer?: Object,
    typeItem?: Object,
    zeroMinWidth?: Object,
    'direction-xs-column'?: Object,
    'direction-xs-column-reverse'?: Object,
    'direction-xs-row-reverse'?: Object,
    'wrap-xs-nowrap'?: Object,
    'wrap-xs-wrap-reverse'?: Object,
    'align-items-xs-center'?: Object,
    'align-items-xs-flex-start'?: Object,
    'align-items-xs-flex-end'?: Object,
    'align-items-xs-baseline'?: Object,
    'align-content-xs-center'?: Object,
    'align-content-xs-flex-start'?: Object,
    'align-content-xs-flex-end'?: Object,
    'align-content-xs-space-between'?: Object,
    'align-content-xs-space-around'?: Object,
    'justify-xs-center'?: Object,
    'justify-xs-flex-end'?: Object,
    'justify-xs-space-between'?: Object,
    'justify-xs-space-around'?: Object,
    'spacing-xs-8'?: Object,
    'spacing-xs-16'?: Object,
    'spacing-xs-24'?: Object,
    'spacing-xs-40'?: Object,
    'grid-xs'?: Object,
    'grid-xs-1'?: Object,
    'grid-xs-2'?: Object,
    'grid-xs-3'?: Object,
    'grid-xs-4'?: Object,
    'grid-xs-5'?: Object,
    'grid-xs-6'?: Object,
    'grid-xs-7'?: Object,
    'grid-xs-8'?: Object,
    'grid-xs-9'?: Object,
    'grid-xs-10'?: Object,
    'grid-xs-11'?: Object,
    'grid-xs-12'?: Object,
  |};
  declare export type GridProps = {|
    ...MUI$BaseProps,
    alignContent?: AlignContent,
    alignItems?: AlignItems,
    children?: React$Node,
    classes?: GridClasses,
    className?: string,
    component?: React$ElementType,
    container?: boolean,
    direction?: Direction,
    hidden?: any,
    item?: boolean,
    justify?: Justify,
    lg?: GridSizes,
    md?: GridSizes,
    sm?: GridSizes,
    spacing?: Spacing,
    wrap?: Wrap,
    xl?: GridSizes,
    xs?: GridSizes,
    zeroMinWidth?: boolean,
  |};
  declare var Grid: React$ComponentType<GridProps>;
  declare export default typeof Grid;
}

declare module '@material-ui/core/GridList' {
  declare export type CellHeight = number | 'auto';

  declare export type GridListClasses = {|
    root?: Object,
  |};
  declare export type GridListProps = {|
    ...MUI$BaseProps,
    cellHeight?: CellHeight,
    children: React$Node,
    classes?: GridListClasses,
    className?: string,
    cols?: number,
    component?: React$ElementType,
    spacing?: number,
  |};
  declare var GridList: React$ComponentType<GridListProps>;
  declare export default typeof GridList;
}

declare module '@material-ui/core/GridListTile' {
  declare export type GridListTileClasses = {|
    root?: Object,
    tile?: Object,
    imgFullHeight?: Object,
    imgFullWidth?: Object,
  |};
  declare export type GridListTileProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: GridListTileClasses,
    className?: string,
    cols?: number,
    component?: React$ElementType,
    rows?: number
  |};
  declare var GridListTitle: React$ComponentType<GridListTileProps>;
  declare export default typeof GridListTitle;
}

declare module '@material-ui/core/GridListTileBar' {
  declare export type TitlePosition = 'top' | 'bottom';
  declare export type ActionPosition = 'left' | 'right';

  declare export type GridListTileBarClasses = {|
    root?: Object,
    rootBottom?: Object,
    rootTop?: Object,
    rootWithSubtitle?: Object,
    titleWrap?: Object,
    titleWrapActionLeft?: Object,
    titleWrapActionRight?: Object,
    title?: Object,
    subtitle?: Object,
    actionIconPositionLeft?: Object,
    childImg?: Object,
  |};
  declare export type GridListTileBarProps = {|
    ...MUI$BaseProps,
    actionIcon?: React$Node,
    actionPosition?: ActionPosition,
    classes?: GridListTileBarClasses,
    className?: string,
    subtitle?: React$Node,
    title: React$Node,
    titlePosition?: TitlePosition
  |};
  declare var GridListTitleBar: React$ComponentType<GridListTileBarProps>;
  declare export default typeof GridListTitleBar;
}

declare module '@material-ui/core/Hidden' {
  import type { Breakpoint } from '@material-ui/core/styles/createBreakpoints';

  declare export type HiddenProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    implementation?: 'js' | 'css',
    initialWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    lgDown?: boolean,
    lgUp?: boolean,
    mdDown?: boolean,
    mdUp?: boolean,
    only?: Breakpoint | Array<Breakpoint>,
    smDown?: boolean,
    smUp?: boolean,
    xlDown?: boolean,
    xlUp?: boolean,
    xsDown?: boolean,
    xsUp?: boolean,
  |};
  declare var Hidden: React$ComponentType<HiddenProps>;
  declare export default typeof Hidden;
}

declare module '@material-ui/core/Hidden/HiddenCss' {
  import typeof Hidden from '@material-ui/core/Hidden';

  declare var HiddenCss: React$ComponentType<React$ElementProps<Hidden>>;
  declare export default typeof HiddenCss;
}

declare module '@material-ui/core/Hidden/HiddenJs' {
  import typeof Hidden from '@material-ui/core/Hidden';

  declare var HiddenJs: React$ComponentType<React$ElementProps<Hidden>>;
  declare export default typeof HiddenJs;
}

declare module '@material-ui/core/Icon' {
  declare export type Color =
    | 'inherit'
    | 'secondary'
    | 'action'
    | 'disabled'
    | 'error'
    | 'primary';

  declare export type IconClasses = {|
    root?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    colorAction?: Object,
    colorDisabled?: Object,
    colorError?: Object,
    fontSize?: Object,
  |};
  declare export type IconProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: IconClasses,
    color?: Color,
    fontSize?: boolean,
  |};
  declare var Icon: React$ComponentType<IconProps>;
  declare export default typeof Icon;
}

declare module '@material-ui/core/IconButton' {
  import type { ButtonBaseProps } from '@material-ui/core/ButtonBase';
  declare export type Color =
    | 'default'
    | 'inherit'
    | 'primary'
    | 'secondary';

  declare export type IconButtonClasses = {|
    root?: Object,
    colorInherit?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    disabled?: Object,
    label?: Object,
  |};
  declare export type IconButtonProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    children?: React$Node,
    classes?: IconButtonClasses,
    className?: string,
    color?: Color,
    disabled?: boolean,
    disableRipple?: boolean,
  |};
  declare var IconButton: React$ComponentType<IconButtonProps>;
  declare export default typeof IconButton;
}

declare module '@material-ui/core/Input' {
  declare export type InputClasses = {|
    root?: Object,
    formControl?: Object,
    inkbar?: Object,
    error?: Object,
    focused?: Object,
    disabled?: Object,
    underline?: Object,
    multiline?: Object,
    fullWidth?: Object,
    input?: Object,
    inputDense?: Object,
    inputDisabled?: Object,
    inputType?: Object,
    inputMultiline?: Object,
    inputSearch?: Object,
  |};
  declare export type InputProps = {|
    ...MUI$BaseProps,
    autoComplete?: string,
    autoFocus?: boolean,
    classes?: InputClasses,
    className?: string,
    defaultValue?: string | number,
    disabled?: boolean,
    disableUnderline?: boolean,
    endAdornment?: React$Node,
    error?: boolean,
    fullWidth?: boolean,
    id?: string,
    inputComponent?: React$ElementType,
    inputProps?: Object,
    inputRef?: React$Ref<any>,
    margin?: 'dense' | 'none',
    multiline?: boolean,
    name?: string,
    onChange?: (event: SyntheticInputEvent<>) => void,
    onClean?: () => void,
    onDirty?: () => void,
    placeholder?: string,
    rows?: string | number,
    rowsMax?: string | number,
    startAdornment?: React$Node,
    type?: string,
    value?: string | number | Array<string | number>,

    readOnly?: boolean,
    onBlur?: (event: SyntheticFocusEvent<>) => void,
    onFocus?: (event: SyntheticFocusEvent<>) => void,
    onKeyDown?: (event: SyntheticKeyboardEvent<>) => void,
    onKeyUp?: (event: SyntheticKeyboardEvent<>) => void,
  |};
  declare var Input: React$ComponentType<InputProps>;
  declare export default typeof Input;
}

declare module '@material-ui/core/InputAdornment' {
  declare export type InputAdornmentClasses = {|
    root?: Object,
    positionStart?: Object,
    positionEnd?: Object,
  |};
  declare export type InputAdornmentProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    classes?: InputAdornmentClasses,
    className?: string,
    component?: React$ElementType,
    disableTypography?: boolean,
    position?: 'start' | 'end',
  |};
  declare var InputAdornment: React$ComponentType<InputAdornmentProps>;
  declare export default typeof InputAdornment;
}

declare module '@material-ui/core/InputLabel' {
  import type { FormLabelProps, FormLabelClasses } from '@material-ui/core/FormLabel';
  declare export type InputLabelClasses = {|
    root?: Object,
    formControl?: Object,
    labelDense?: Object,
    shrink?: Object,
    animated?: Object,
    disabled?: Object,
  |};
  declare export type InputLabelProps = {|
    ...MUI$BaseProps,
    ...FormLabelProps,
    children?: React$Node,
    classes?: InputLabelClasses,
    className?: string,
    disableAnimation?: boolean,
    disabled?: boolean,
    error?: boolean,
    focused?: boolean,
    FormLabelClasses?: FormLabelClasses,
    margin?: 'dense',
    required?: boolean,
    shrink?: boolean
  |};
  declare var InputLabel: React$ComponentType<InputLabelProps>;
  declare export default typeof InputLabel;
}

declare module '@material-ui/core/Input/Textarea' {
  declare export type Rows = string | number;

  declare var Textarea: React$ComponentType<{|
    classes?: Object,
    className?: string,
    defaultValue?: string | number,
    disabled?: boolean,
    onChange?: Function,
    rows: Rows,
    rowsMax?: string | number,
    textareaRef?: Function,
    value?: string | number
  |}>;

  declare export default typeof Textarea;
}

declare module '@material-ui/core/Portal' {
  declare export type PortalProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    container?: React$ElementType,
    onRendered?: () => void,
  |};
  declare var Portal: React$ComponentType<PortalProps>;
  declare export default typeof Portal;
}

declare module '@material-ui/core/internal/transition' {
  declare export type TransitionDuration = number | { enter: number, exit: number };
  declare export type TransitionCallback = (element: HTMLElement) => void;
  declare export type TransitionClasses = {|
    appear?: string,
    appearActive?: string,
    enter?: string,
    enterActive?: string,
    exit?: string,
    exitActive?: string
  |};
  declare export type TransitionProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    in?: boolean,
    mountOnEnter?: boolean,
    unmountOnExit?: boolean,
    appear?: boolean,
    enter?: boolean,
    exit?: boolean,
    timeout?: TransitionDuration,
    addEndListener?: any,
    onEnter?: TransitionCallback,
    onEntering?: TransitionCallback,
    onEntered?: TransitionCallback,
    onExit?: TransitionCallback,
    onExiting?: TransitionCallback,
    onExited?: TransitionCallback,
  |};
}

declare module '@material-ui/core/List' {
  declare export type ListClasses = {|
    root?: Object,
    padding?: Object,
    dense?: Object,
    subheader?: Object,
  |};
  declare export type ListProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: ListClasses,
    className?: string,
    component?: React$ElementType,
    dense?: boolean,
    disablePadding?: boolean,
    subheader?: React$Node
  |};
  declare var List: React$ComponentType<ListProps>;
  declare export default typeof List;
}

declare module '@material-ui/core/ListItem' {
  declare export type ListItemClasses = {|
    root?: Object,
    container?: Object,
    keyboardFocused?: Object,
    default?: Object,
    dense?: Object,
    disabled?: Object,
    divider?: Object,
    gutters?: Object,
    button?: Object,
    secondaryAction?: Object,
  |};
  declare export type ListItemProps = {|
    ...MUI$BaseProps,
    button?: boolean,
    children?: React$Node,
    classes?: ListItemClasses,
    className?: string,
    component?: React$ElementType,
    ContainerComponent?: React$ElementType,
    ContainerProps?: Object,
    dense?: boolean,
    disableGutters?: boolean,
    divider?: boolean
  |};
  declare var ListItem: React$ComponentType<ListItemProps>;
  declare export default typeof ListItem;
}

declare module '@material-ui/core/ListItemAvatar' {
  declare export type ListItemAvatarClasses = {|
    root?: Object,
    icon?: Object,
  |};
  declare export type ListItemAvatarProps = {|
    ...MUI$BaseProps,
    children: React$Element<any>,
    classes?: ListItemAvatarClasses,
    className?: string
  |};
  declare var ListItemAvatar: React$ComponentType<ListItemAvatarProps>;
  declare export default typeof ListItemAvatar;
}

declare module '@material-ui/core/ListItemIcon' {
  declare export type ListItemIconClasses = {|
    root?: Object,
  |};
  declare export type ListItemIconProps = {|
    ...MUI$BaseProps,
    children: React$Element<any>,
    classes?: ListItemIconClasses,
    className?: string
  |};
  declare var ListItemIcon: React$ComponentType<ListItemIconProps>;
  declare export default typeof ListItemIcon;
}

declare module '@material-ui/core/ListItemSecondaryAction' {
  declare export type ListItemSecondaryActionClasses = {|
    root?: Object,
  |};
  declare export type ListItemSecondaryActionProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: ListItemSecondaryActionClasses,
    className?: string
  |};
  declare var ListItemSecondaryAction: React$ComponentType<ListItemSecondaryActionProps>;
  declare export default typeof ListItemSecondaryAction;
}

declare module '@material-ui/core/ListItemText' {
  declare export type ListItemTextClasses = {|
    root?: Object,
    inset?: Object,
    dense?: Object,
    primary?: Object,
    secondary?: Object,
    textDense?: Object,
  |};
  declare export type ListItemTextProps = {|
    ...MUI$BaseProps,
    classes?: ListItemTextClasses,
    className?: string,
    disableTypography?: boolean,
    inset?: boolean,
    primary?: React$Node,
    secondary?: React$Node
  |};
  declare var ListItemText: React$ComponentType<ListItemTextProps>;
  declare export default typeof ListItemText;
}

declare module '@material-ui/core/ListSubheader' {
  declare export type Color = 'default' | 'primary' | 'inherit';

  declare export type ListSubheaderClasses = {|
    root?: Object,
    colorPrimary?: Object,
    colorInherit?: Object,
    inset?: Object,
    sticky?: Object,
  |};
  declare export type ListSubheaderProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: ListSubheaderClasses,
    className?: string,
    color?: Color,
    component?: React$ElementType,
    disableSticky?: boolean,
    inset?: boolean
  |};
  declare var ListSubheader: React$ComponentType<ListSubheaderProps>;
  declare export default typeof ListSubheader;
}

declare module '@material-ui/core/Menu' {
  import type { MenuListProps } from '@material-ui/core/MenuList';
  import type { PaperProps } from '@material-ui/core/Paper';
  import type { PopoverClasses } from '@material-ui/core/Popover';
  import type { TransitionCallback } from '@material-ui/core/internal/transition';

  declare export type TransitionDuration =
    | number
    | { enter?: number, exit?: number }
    | 'auto';

  declare export type MenuClasses = {|
    paper: Object,
  |};
  declare export type MenuProps = {|
    ...MUI$BaseProps,
    anchorEl?: ?HTMLElement,
    children?: React$Node,
    classes?: MenuClasses,
    MenuListProps?: MenuListProps,
    onClose?: Function,
    onEnter?: TransitionCallback,
    onEntered?: TransitionCallback,
    onEntering?: TransitionCallback,
    onExit?: TransitionCallback,
    onExited?: TransitionCallback,
    onExiting?: TransitionCallback,
    open: boolean,
    PaperProps?: Object,
    PopoverClasses?: PopoverClasses,
    TransitionComponent?: React$ElementType,
    transitionDuration?: TransitionDuration,

    id?: string,
  |};
  declare var Menu: React$ComponentType<MenuProps>;
  declare export default typeof Menu;
}

declare module '@material-ui/core/MenuItem' {
  declare export type MenuItemClasses = {|
    root?: Object,
    selected?: Object,
  |};
  declare export type MenuItemProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: MenuItemClasses,
    className?: string,
    component?: React$ElementType,
    selected?: boolean,

    // Typically want to add a value for the onChange event of the Menu/Select
    value?: any,
  |};
  declare var MenuItem: React$ComponentType<MenuItemProps>;
  declare export default typeof MenuItem;
}

declare module '@material-ui/core/MenuList' {
  declare export type MenuListProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
  |};
  declare var MenuList: React$ComponentType<MenuListProps>;
  declare export default typeof MenuList;
}


declare module '@material-ui/core/MobileStepper' {
  declare export type Position = 'bottom' | 'top' | 'static';
  declare export type Variant = 'text' | 'dots' | 'progress';

  declare export type MobileStepperClasses = {|
    root?: Object,
    positionBottom?: Object,
    positionTop?: Object,
    positionStatic?: Object,
    dots?: Object,
    dot?: Object,
    dotActive?: Object,
    progress?: Object,
  |};
  declare export type MobileStepperProps = {|
    ...MUI$BaseProps,
    activeStep?: number,
    backButton?: React$Node,
    classes?: MobileStepperClasses,
    className?: string,
    nextButton?: React$Node,
    position?: Position,
    steps: number,
    variant?: Variant,
  |};
  declare var MobileStepper: React$ComponentType<MobileStepperProps>;
  declare export default typeof MobileStepper;
}

// declare module '@material-ui/core/Backdrop' {
//   declare export type BackdropProps = {|
//     children?: React$Node,
//     classes?: Object,
//     className?: string,
//     invisible?: boolean
//   |}
//   declare var Backdrop: React$ComponentType<BackdropProps>;
//
//   declare export default typeof Backdrop;
// }

declare module '@material-ui/core/Modal' {
  import type { PortalProps } from '@material-ui/core/Portal';

  declare export type ModalClasses = {|
    root?: Object,
    hidden?: Object,
  |};
  declare export type ModalProps = {|
    ...MUI$BaseProps,
    ...PortalProps,
    BackdropComponent?: React$ElementType,
    BackdropProps?: Object,
    children?: React$Element<any>,
    classes?: ModalClasses,
    className?: string,
    container?: React$ElementType,
    disableAutoFocus?: boolean,
    disableBackdropClick?: boolean,
    disableEnforceFocus?: boolean,
    disableEscapeKeyDown?: boolean,
    disableRestoreFocus?: boolean,
    hideBackdrop?: boolean,
    keepMounted?: boolean,
    manager?: Object,
    onBackdropClick?: (event: SyntheticEvent<>) => void,
    onClose?: (event: SyntheticEvent<>) => void,
    onEscapeKeyDown?: (event: SyntheticEvent<>) => void,
    onRendered?: () => void,
    open: boolean,
  |};
  declare var Modal: React$ComponentType<ModalProps>;
  declare export default typeof Modal;
}

declare module '@material-ui/core/Modal/ModalManager' {
  declare var ModalManager: any;
  declare export default typeof ModalManager;
}

declare module '@material-ui/core/Paper' {
  declare export type PaperClasses = {|
    root?: Object,
    rounded?: Object,
    shadow0?: Object,
    shadow1?: Object,
    shadow2?: Object,
    shadow3?: Object,
    shadow4?: Object,
    shadow5?: Object,
    shadow6?: Object,
    shadow7?: Object,
    shadow8?: Object,
    shadow9?: Object,
    shadow10?: Object,
    shadow11?: Object,
    shadow12?: Object,
    shadow13?: Object,
    shadow14?: Object,
    shadow15?: Object,
    shadow16?: Object,
    shadow17?: Object,
    shadow18?: Object,
    shadow19?: Object,
    shadow20?: Object,
    shadow21?: Object,
    shadow22?: Object,
    shadow23?: Object,
    shadow24?: Object,
  |};
  declare export type PaperProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: PaperClasses,
    className?: string,
    component?: React$ElementType,
    elevation?: number,
    square?: boolean
  |};
  declare var Paper: React$ComponentType<PaperProps>;
  declare export default typeof Paper;
}

declare module '@material-ui/core/Popover' {
  import type { ModalProps } from '@material-ui/core/Modal';
  import type { PaperProps } from '@material-ui/core/Paper';
  import type {
    TransitionCallback,
  } from '@material-ui/core/internal/transition';

  declare export type Position = {
    top: number,
    left: number
  };

  declare export type Origin = {
    horizontal: 'left' | 'center' | 'right' | number,
    vertical: 'top' | 'center' | 'bottom' | number
  };

  declare export type PopoverClasses = {|
    paper?: Object,
  |};
  declare export type PopoverProps = {|
    ...MUI$BaseProps,
    ...ModalProps,
    action?: (actions: Object) => void,
    anchorEl?: ?HTMLElement,
    anchorOrigin?: Origin,
    anchorPosition?: Position,
    anchorReference?: 'anchorEl' | 'anchorPosition',
    children?: React$Node,
    classes?: PopoverClasses,
    container?: React$ElementType,
    elevation?: number,
    getContentAnchorEl?: Function,
    marginThreshold?: number,
    onClose?: (event: SyntheticEvent<>) => void,
    onEnter?: TransitionCallback,
    onEntered?: TransitionCallback,
    onEntering?: TransitionCallback,
    onExit?: TransitionCallback,
    onExited?: TransitionCallback,
    onExiting?: TransitionCallback,
    open: boolean,
    PaperProps?: PaperProps,
    transformOrigin?: Origin,
    TransitionComponent?: React$ElementType,
    transitionDuration?: number | { enter?: number, exit?: number } | 'auto'
  |};
  declare var Popover: React$ComponentType<PopoverProps>;
  declare export default typeof Popover;
}

declare module '@material-ui/core/CircularProgress' {
  declare export type Color = 'primary' | 'secondary' | 'inherit';
  declare export type Mode = 'determinate' | 'indeterminate' | 'static';

  declare export type CircularProgressClases = {|
    root?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    svg?: Object,
    svgIndeterminate?: Object,
    circle?: Object,
    circleIndeterminate?: Object,
  |};
  declare export type CircularProgressProps = {|
    ...MUI$BaseProps,
    classes?: CircularProgressClases,
    className?: string,
    color?: Color,
    size?: number,
    thickness?: number,
    value?: number,
    variant?: Mode,
  |};
  declare var CircularProgress: React$ComponentType<CircularProgressProps>;
  declare export default typeof CircularProgress;
}

declare module '@material-ui/core/LinearProgress' {
  declare export type Color = 'primary' | 'secondary';
  declare export type Variant = 'determinate' | 'indeterminate' | 'buffer' | 'query';

  declare export type LinearProgressClasses = {|
    root?: Object,
    primaryColor?: Object,
    primaryColorBar?: Object,
    primaryDashed?: Object,
    secondaryColor?: Object,
    secondaryColorBar?: Object,
    secondaryDashed?: Object,
    bar?: Object,
    dashed?: Object,
    bufferBar2?: Object,
    rootBuffer?: Object,
    rootQuery?: Object,
    indeterminateBar1?: Object,
    indeterminateBar2?: Object,
    determinateBar1?: Object,
    bufferBar1?: Object,
  |};
  declare export type LinearProgressProps = {|
    ...MUI$BaseProps,
    classes?: LinearProgressClasses,
    className?: string,
    color?: Color,
    value?: number,
    valueBuffer?: number,
    variant?: Variant,
  |};
  declare var LinearProgress: React$ComponentType<LinearProgressProps>;
  declare export default typeof LinearProgress;
}

declare module '@material-ui/core/Radio' {
  declare export type RadioClases = {|
    default?: Object,
    checked?: Object,
    checkedPrimary?: Object,
    checkedSecondary?: Object,
    disabled?: Object,
  |};
  declare export type RadioProps = {|
    ...MUI$BaseProps,
    checked?: boolean | string,
    checkedIcon?: React$Node,
    classes?: RadioClases,
    className?: string,
    disabled?: boolean,
    disableRipple?: boolean,
    icon?: React$Node,
    id?: string,
    inputProps?: Object,
    inputRef?: React$Ref<any>,
    name?: string,
    onChange?: (event: SyntheticEvent<>, checked: boolean) => void,
    type?: string,
    value?: string,
  |};
  declare var Radio: React$ComponentType<RadioProps>;
  declare export default typeof Radio;
}

declare module '@material-ui/core/RadioGroup' {
  import type { FormGroupProps } from '@material-ui/core/FormGroup';
  declare export type RadioGroupProps = {|
    ...MUI$BaseProps,
    ...FormGroupProps,
    children?: React$Node,
    name?: string,
    onChange?: (event: SyntheticEvent<>, value: string) => void,
    value?: string
  |};
  declare var RadioGroup: React$ComponentType<RadioGroupProps>;
  declare export default typeof RadioGroup;
}

declare module '@material-ui/core/Select' {
  import type { ChildrenArray } from 'react';
  import type { InputProps } from '@material-ui/core/Input';
  import type { MenuProps } from '@material-ui/core/Menu';

  declare export type SelectClasses = {|
    root?: Object,
    select?: Object,
    selectMenu?: Object,
    disabled?: Object,
    icon?: Object,
  |};
  declare export type SelectProps = {|
    ...MUI$BaseProps,
    ...InputProps,
    autoWidth?: boolean,
    children?: ChildrenArray<*>,
    className?: string,
    classes?: SelectClasses,
    displayEmpty?: boolean,
    input?: React$Element<any>,
    inputProps?: Object,
    MenuProps?: MenuProps,
    multiple?: boolean,
    native?: boolean,
    onChange?: (event: SyntheticEvent<>, child: Object) => void,
    onClose?: (event: SyntheticEvent<>) => void,
    onOpen?: (event: SyntheticEvent<>) => void,
    open?: boolean,
    renderValue?: (option: Object) => React$Node,
    value?: $ReadOnlyArray<string | number> | string | number
  |};
  declare var Select: React$ComponentType<SelectProps>;
  declare export default typeof Select;
}

declare module '@material-ui/core/Select/SelectInput' {
  declare var SelectInput: React$ComponentType<{|
    autoWidth: boolean,
    children?: React$Node,
    classes?: Object,
    className?: string,
    disabled?: boolean,
    displayEmpty: boolean,
    native: boolean,
    multiple: boolean,
    MenuProps?: Object,
    name?: string,
    onBlur?: Function,
    onChange?: (event: SyntheticUIEvent<*>, child: React$Element<any>) => void,
    onFocus?: Function,
    readOnly?: boolean,
    renderValue?: Function,
    selectRef?: Function,
    value?: string | number | $ReadOnlyArray<string | number>
  |}>;

  declare export default typeof SelectInput;
}

declare module '@material-ui/core/Snackbar' {
  import type {
    TransitionDuration,
    TransitionCallback
  } from '@material-ui/core/internal/transition';
  import type { SnackbarContentProps } from '@material-ui/core/SnackbarContent';

  declare export type Origin = {
    horizontal?: 'left' | 'center' | 'right' | number,
    vertical?: 'top' | 'center' | 'bottom' | number
  };

  declare export type SnackbarClasses = {|
    root?: Object,
    anchorTopCenter?: Object,
    anchorBottomCenter?: Object,
    anchorTopRight?: Object,
    anchorBottomRight?: Object,
    anchorTopLeft?: Object,
    anchorBottomLeft?: Object,
  |};
  declare export type SnackbarProps = {|
    ...MUI$BaseProps,
    action?: React$Node,
    anchorOrigin?: Origin,
    autoHideDuration?: ?number,
    children?: React$Element<any>,
    classes?: SnackbarClasses,
    className?: string,
    key?: any,
    message?: React$Node,
    onClose?: (event: SyntheticEvent<>, reason: string) => void,
    onEnter?: TransitionCallback,
    onEntered?: TransitionCallback,
    onEntering?: TransitionCallback,
    onExit?: TransitionCallback,
    onExited?: TransitionCallback,
    onExiting?: TransitionCallback,
    open?: boolean,
    resumeHideDuration?: ?number,
    ContentProps?: SnackbarContentProps,
    TransitionComponent?: React$ElementType,
    transitionDuration?: TransitionDuration,
  |};
  declare var Snackbar: React$ComponentType<SnackbarProps>;
  declare export default typeof Snackbar;
}

declare module '@material-ui/core/SnackbarContent' {
  import type { PaperProps } from '@material-ui/core/Paper';
  declare export type SnackbarContentClasses = {|
    root?: Object,
    message?: Object,
    action?: Object,
  |};
  declare export type SnackbarContentProps = {|
    ...MUI$BaseProps,
    ...PaperProps,
    action?: React$Node,
    classes?: SnackbarContentClasses,
    className?: string,
    message?: React$Node
  |};
  declare var SnackbarContent: React$ComponentType<SnackbarContentProps>;
  declare export default typeof SnackbarContent;
}

declare module '@material-ui/core/Step' {
  declare export type StepClasses = {|
    root?: Object,
    horizontal?: Object,
    vertical?: Object,
    alternativeLabel?: Object,
  |};
  declare export type StepProps = {|
    ...MUI$BaseProps,
    active?: boolean,
    children?: React$Node,
    classes?: StepClasses,
    className?: string,
    completed?: boolean,
    disabled?: boolean,
  |};
  declare var Step: React$ComponentType<StepProps>;
  declare export default typeof Step;
}

declare module '@material-ui/core/StepButton' {
  import type { ButtonBaseProps } from '@material-ui/core/ButtonBase';

  declare export type StepButtonClasses = {|
    root?: Object,
  |};
  declare export type StepButtonProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    children?: React$Node,
    classes?: StepButtonClasses,
    className?: string,
    icon?: React$Node,
    optional?: boolean,
  |}
  declare var StepButton: React$ComponentType<StepButtonProps>;
  declare export default typeof StepButton;
}

declare module '@material-ui/core/StepContent' {
  import type { TransitionDuration } from '@material-ui/core/internal/transition';
  import type { Orientation } from '@material-ui/core/Stepper';

  declare export type StepContentClasses = {|
    root?: Object,
    last?: Object,
    transition?: Object,
  |};
  declare export type StepContentProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: StepContentClasses,
    TransitionComponent?: React$ElementType,
    transitionDuration?: TransitionDuration
  |};
  declare var StepContent: React$ComponentType<StepContentProps>;
  declare export default typeof StepContent;
}

declare module '@material-ui/core/StepIcon' {
  declare export type StepIconClasses = {|
    root?: Object,
    completed?: Object,
  |};
  declare export type StepIconProps = {|
    ...MUI$BaseProps,
    active?: boolean,
    className?: string,
    classes?: StepIconClasses,
    completed?: boolean,
    icon: React$Node,
  |};
  declare var StepIcon: React$ComponentType<StepIconProps>;
  declare export default typeof StepIcon;
}

declare module '@material-ui/core/StepLabel' {
  import type { Orientation } from '@material-ui/core/Stepper';

  declare export type StepLabelClasses = {|
    root?: Object,
    horizontal?: Object,
    vertical?: Object,
    alternativeLabel?: Object,
    disabled?: Object,
    label?: Object,
    labelActive?: Object,
    labelCompleted?: Object,
    labelAlternativeLabel?: Object,
    iconContainer?: Object,
    iconContainerNoAlternative?: Object,
    labelContainer?: Object,
  |};
  declare export type StepLabelProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: StepLabelClasses,
    className?: string,
    disabled?: boolean,
    icon?: React$Node,
    optional?: boolean,
  |};
  declare var StepLabel: React$ComponentType<StepLabelProps>;
  declare export default typeof StepLabel;
}

declare module '@material-ui/core/Stepper' {
  import type { ChildrenArray } from 'react';
  import typeof Step from '@material-ui/core/Step';

  declare export type Orientation = 'horizontal' | 'vertical';

  declare export type StepperClasses = {|
    root?: Object,
    horizontal?: Object,
    vertical?: Object,
    alternativeLabel?: Object,
  |};
  declare export type StepperProps = {|
    ...MUI$BaseProps,
    activeStep?: number,
    alternativeLabel?: boolean,
    children: ChildrenArray<React$Element<Step>>,
    classes?: StepperClasses,
    className?: string,
    connector?: React$Element<>,
    nonLinear?: boolean,
    orientation?: Orientation
  |};
  declare var Stepper: React$ComponentType<StepperProps>;
  declare export default typeof Stepper;
}

declare module '@material-ui/core/styles/colorManipulator' {
  declare module.exports: {
    convertColorToString: (color: Object) => any,
    convertHexToRGB: (color: string) => any,
    decomposeColor: (color: string) => any,
    getContrastRatio: (foreground: string, background: string) => any,
    getLuminance: (color: string) => any,
    emphasize: (color: string, coefficient: number) => any,
    fade: (color: string, value: number) => any,
    darken: (color: string, coefficient: number) => any,
    ligthen: (color: string, coefficient: number) => any
  };
}

declare module '@material-ui/core/styles/createBreakpoints' {
  declare export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  declare export type BreakpointValues = { [key: Breakpoint]: number };

  declare export type Breakpoints = {|
    keys: Breakpoint[];
    values: BreakpointValues;
    up: (key: Breakpoint | number) => string;
    down: (key: Breakpoint | number) => string;
    between: (start: Breakpoint, end: Breakpoint) => string;
    only: (key: Breakpoint) => string;
    width: (key: Breakpoint) => number;
  |};

  declare module.exports: {
    keys: Array<Breakpoint>,
    default: (breakpoints: Object) => any
  };
}

declare module '@material-ui/core/styles/createGenerateClassName' {
  declare module.exports: () => any;
}

declare module '@material-ui/core/styles/createMixins' {
  declare export type Mixins = {|
    gutters: (styles: Object) => Object;
    toolbar: Object;
  |};

  declare module.exports: (
    breakpoints: Object,
    spacing: Object,
    mixins: Object
  ) => any;
}

declare module '@material-ui/core/styles/createMuiTheme' {
  import type { Breakpoints } from '@material-ui/core/styles/createBreakpoints';
  import type { Mixins } from '@material-ui/core/styles/createMixins';
  import type { Palette } from '@material-ui/core/styles/createPalette';
  import type { Shadows } from '@material-ui/core/styles/shadows';
  import type { Spacing } from '@material-ui/core/styles/spacing';
  import type { Transitions } from '@material-ui/core/styles/transitions';
  import type { Typography } from '@material-ui/core/styles/createTypography';
  import type { ZIndex } from '@material-ui/core/styles/zIndex';

  declare export type Direction = 'ltr' | 'rtl';
  declare export type Theme = {|
    direction: Direction;
    palette: Palette;
    typography: Typography;
    mixins: Mixins;
    breakpoints: Breakpoints;
    shadows: Shadows;
    transitions: Transitions;
    spacing: Spacing;
    zIndex: ZIndex;
    overrides?: Object;
  |};

  declare module.exports: (options: Object) => Theme;
}

declare module '@material-ui/core/styles/createPalette' {

  declare export type CommonColors = {|
    black: string;
    white: string;
  |};

  declare export type PaletteType = 'light' | 'dark';

  declare export type Color = {|
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    A100: string;
    A200: string;
    A400: string;
    A700: string;
  |};
  declare export type TypeText = {|
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  |};

  declare export type TypeAction = {|
    active: string;
    hover: string;
    selected: string;
    disabled: string;
    disabledBackground: string;
  |};

  declare export type TypeBackground = {|
    default: string;
    paper: string;
  |}

  declare export type PaletteColor = {|
    light: string;
    main: string;
    dark: string;
    contrastText: string;
  |}

  declare export type TypeObject = {|
    text: TypeText;
    action: TypeAction;
    background: TypeBackground;
  |}

  declare export type Palette = {|
    common: CommonColors;
    type: PaletteType;
    contrastThreshold: number;
    tonalOffset: number;
    primary: PaletteColor;
    secondary: PaletteColor;
    error: PaletteColor;
    grey: Color;
    text: TypeText;
    divider: string;
    action: TypeAction;
    background: TypeBackground;
    getContrastText: (color: string) => string;
  |}

  declare module.exports: {
    light: TypeObject,
    dark: TypeObject,
    default: (palette: Object) => any
  };
}

declare module '@material-ui/core/styles/createTypography' {
  declare export type TextStyle =
    | 'display1'
    | 'display2'
    | 'display3'
    | 'display4'
    | 'headline'
    | 'title'
    | 'subheading'
    | 'body1'
    | 'body2'
    | 'caption';

  declare export type Style = TextStyle | 'button';

  declare export type FontStyle = {|
    fontFamily: string,
    fontSize: string,
    fontWeightLight: number,
    fontWeightRegular: number,
    fontWeightMedium: number,
    htmlFontSize?: number;
  |}

  declare export type TypographyStyle = {|
    color?: string,
    fontFamily: string,
    fontSize: string,
    fontWeight: string,
    letterSpacing?: string,
    lineHeight?: string,
    textTransform?: string,
  |};

  declare export type TypographyUtils = {
    pxToRem: (px: number) => string;
  }

  declare export type Typography = {
    ...FontStyle,
    ...TypographyUtils,
    [key: Style]: TypographyStyle,
  };

  declare module.exports: (
    palette: Object,
    typography: Object | Function
  ) => any;
}

declare module '@material-ui/core/styles/getStylesCreator' {
  declare module.exports: (stylesOrCreator: Object | (Object => Object)) => any;
}

declare module '@material-ui/core/styles' {
  declare module.exports: {
    MuiThemeProvider: $Exports<'@material-ui/core/styles/MuiThemeProvider'>,
    withStyles: $Exports<'@material-ui/core/styles/withStyles'>,
    withTheme: $Exports<'@material-ui/core/styles/withTheme'>,
    createMuiTheme: $Exports<'@material-ui/core/styles/createMuiTheme'>
  };
}

declare module '@material-ui/core/styles/MuiThemeProvider' {
  declare export type MuiThemeProviderProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    disableStylesGeneration?: boolean,
    sheetsManager?: Object,
    theme: Object | Function,
  |};
  declare module.exports: React$ComponentType<MuiThemeProviderProps>;
}

declare module '@material-ui/core/styles/shadows' {
  declare export type Shadows = [
    'none',
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ];

  declare module.exports: Array<any>;
}

declare module '@material-ui/core/styles/spacing' {
  declare export type Spacing = {|
    unit: number;
  |};

  declare module.exports: Object;
}

declare module '@material-ui/core/styles/themeListener' {
  declare module.exports: {
    CHANNEL: string,
    default: Object
  };
}

declare module '@material-ui/core/styles/transitions' {
  declare export type Easing = {|
    easeInOut: string;
    easeOut: string;
    easeIn: string;
    sharp: string;
  |};

  declare export type Duration = {|
    shortest: number;
    shorter: number;
    short: number;
    standard: number;
    complex: number;
    enteringScreen: number;
    leavingScreen: number;
  |};

  declare export type Transitions = {|
    easing: Easing;
    duration: Duration;
    create(
      props: string | string[],
      options?: {| duration?: number | string; easing?: string; delay?: number | string |},
    ): string;
    getAutoHeightDuration(height: number): number;
  |};

  declare module.exports: {
    easing: Object,
    duration: Object,
    formatMs: (milliseconds: number) => string,
    isString: (value: any) => boolean,
    isNumber: (value: any) => boolean,
    default: Object
  };
}

declare module '@material-ui/core/styles/withStyles' {
  declare export type Options = {
    flip?: boolean,
    withTheme?: boolean,
    name?: string,
    media?: string,
    meta?: string,
    index?: number,
    link?: boolean,
    element?: HTMLStyleElement,
    generateClassName?: Function
  };

  declare module.exports: (
    stylesOrCreator: Object,
    options?: Options
  ) => <
    OwnProps: {},
    Props: $Supertype<
      OwnProps & {
        classes: { +[string]: string },
        innerRef: React$Ref<React$ElementType>
      }
    >
  >(
    Component: React$ComponentType<Props>
  ) => React$ComponentType<OwnProps>;
}

declare module '@material-ui/core/styles/withTheme' {
  declare module.exports: () => <Props: {}>(
    Component: React$ComponentType<Props>
  ) => React$ComponentType<Props>;
}

declare module '@material-ui/core/styles/zIndex' {
  declare export type ZIndex = {|
    mobileStepper: number;
    appBar: number;
    drawer: number;
    modal: number;
    snackbar: number;
    tooltip: number;
  |};

  declare module.exports: Object;
}

declare module '@material-ui/icons/ArrowDownward' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/icons/ArrowDropDown' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/icons/Cancel' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/icons/CheckBox' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/icons/CheckBoxOutlineBlank' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/icons/CheckCircle' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/icons/IndeterminateCheckBox' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/icons/KeyboardArrowLeft' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/icons/KeyboardArrowRight' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/icons/RadioButtonChecked' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/icons/RadioButtonUnchecked' {
  declare module.exports: React$ComponentType<Object>;
}

declare module '@material-ui/core/SvgIcon' {
  declare export type Color = 'action' | 'disabled' | 'error' | 'inherit' | 'primary' | 'secondary';
  declare export type SvgIconClasses = {|
    root?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    colorAction?: Object,
    colorDisabled?: Object,
    colorError?: Object,
    fontSize?: Object,
  |};
  declare export type SvgIconProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    classes?: SvgIconClasses,
    className?: string,
    color?: Color,
    fontSize?: boolean,
    nativeColor?: string,
    titleAccess?: string,
    viewBox?: string,
  |};
  declare var SvgIcon: React$ComponentType<SvgIconProps>;
  declare export default typeof SvgIcon;
}

declare module '@material-ui/core/Switch' {
  declare export type SwitchClasses = {|
    root?: Object,
    bar?: Object,
    icon?: Object,
    iconChecked?: Object,
    default?: Object,
    checked?: Object,
    checkedPrimary?: Object,
    checkedSecondary?: Object,
    disabled?: Object,
  |};
  declare export type SwitchProps = {|
    ...MUI$BaseProps,
    checked?: boolean | string,
    checkedIcon?: React$Node,
    classes?: SwitchClasses,
    className?: string,
    color: 'primary' | 'secondary',
    disabled?: boolean,
    disableRipple?: boolean,
    icon?: React$Node,
    id?: string,
    inputProps?: Object,
    inputRef?: React$Ref<>,
    name?: string,
    onChange?: (event: SyntheticEvent<>, checked: boolean) => void,
    type?: string,
    value?: string,
  |};
  declare var Switch: React$ComponentType<SwitchProps>;
  declare export default typeof Switch;
}

declare module '@material-ui/core/Table' {
  declare export type TableClasses = {|
    root?: Object,
  |};
  declare export type TableProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    classes?: TableClasses,
    className?: string,
    component?: React$ElementType
  |};
  declare var Table: React$ComponentType<TableProps>;
  declare export default typeof Table;
}

declare module '@material-ui/core/TableBody' {
  declare export type TableBodyProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    component?: React$ElementType
  |};
  declare var TableBody: React$ComponentType<TableBodyProps>;
  declare export default typeof TableBody;
}

declare module '@material-ui/core/TableCell' {
  declare export type Padding = 'default' | 'checkbox' | 'dense' | 'none';
  declare export type Direction = 'asc' | 'desc' | false;
  declare export type Variant = 'head' | 'body' | 'footer';

  declare export type TableCellClasses = {|
    root?: Object,
    numeric?: Object,
    typeHead?: Object,
    typeBody?: Object,
    typeFooter?: Object,
    paddingDefault?: Object,
    paddingDense?: Object,
    paddingCheckbox?: Object,
  |};
  declare export type TableCellProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: TableCellClasses,
    className?: string,
    component?: React$ElementType,
    numeric?: boolean,
    padding?: Padding,
    scope?: string,
    sortDirection?: Direction,
    variant?: Variant,
  |};
  declare var TableCell: React$ComponentType<TableCellProps>;
  declare export default typeof TableCell;
}

declare module '@material-ui/core/TableFooter' {
  declare export type TableFooterProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    component?: React$ElementType,
  |};
  declare var TableFooter: React$ComponentType<TableFooterProps>;
  declare export default typeof TableFooter;
}

declare module '@material-ui/core/TableHead' {
  declare export type TableHeadProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    component?: React$ElementType
  |};
  declare var TableHead: React$ComponentType<TableHeadProps>;
  declare export default typeof TableHead;
}

declare module '@material-ui/core/TablePagination' {
  import type { IconButtonProps } from '@material-ui/core/IconButton';
  declare export type LabelDisplayedRowsArgs = {
    from: number,
    to: number,
    count: number,
  };
  declare export type LabelDisplayedRows = (
    paginationInfo: LabelDisplayedRowsArgs
  ) => Node;

  declare export type TablePaginationClasses = {|
    root?: Object,
    toolbar?: Object,
    spacer?: Object,
    caption?: Object,
    input?: Object,
    selectRoot?: Object,
    select?: Object,
    selectIcon?: Object,
    actions?: Object,
  |};
  declare export type TablePaginationProps = {|
    ...MUI$BaseProps,
    ActionsComponent?: React$ElementType,
    backIconButtonProps?: IconButtonProps,
    classes?: TablePaginationClasses,
    component?: React$ElementType,
    count: number,
    labelDisplayedRows?: LabelDisplayedRows,
    labelRowsPerPage?: React$Node,
    nextIconButtonProps?: IconButtonProps,
    onChangePage: (event: SyntheticInputEvent<>, page: number) => void,
    onChangeRowsPerPage?: (event: SyntheticInputEvent<>) => void,
    page: number,
    rowsPerPage: number,
    rowsPerPageOptions?: Array<number>
  |};
  declare var TablePagination: React$ComponentType<TablePaginationProps>;
  declare export default typeof TablePagination;
}

declare module '@material-ui/core/TableRow' {
  declare export type TableRowClasses = {|
    root?: Object,
    typeHead?: Object,
    typeFooter?: Object,
    selected?: Object,
    hover?: Object,
  |};
  declare export type TableRowProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: TableRowClasses,
    className?: string,
    component?: React$ElementType,
    hover?: boolean,
    selected?: boolean
  |};
  declare var TableRow: React$ComponentType<TableRowProps>;
  declare export default typeof TableRow;
}

declare module '@material-ui/core/TableSortLabel' {
  import type { ButtonBaseProps } from '@material-ui/core/ButtonBase';
  declare export type Direction = 'asc' | 'desc';

  declare export type TableSortLabelClasses = {|
    root?: Object,
    active?: Object,
    icon?: Object,
    desc?: Object,
    asc?: Object,
  |};
  declare export type TableSortLabelProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    active?: boolean,
    children?: React$Node,
    classes?: TableSortLabelClasses,
    className?: string,
    direction?: Direction
  |};
  declare var TableSortLabel: React$ComponentType<TableSortLabelProps>;
  declare export default typeof TableSortLabel;
}

declare module '@material-ui/core/Tab' {
  import type { ButtonBaseProps } from '@material-ui/core/ButtonBase';
  declare export type TabClasses = {|
    root?: Object,
    rootLabelIcon?: Object,
    rootInherit?: Object,
    rootPrimary?: Object,
    rootPrimarySelected?: Object,
    rootPrimaryDisabled?: Object,
    rootSecondary?: Object,
    rootSecondarySelected?: Object,
    rootSecondaryDisabled?: Object,
    rootInheritSelected?: Object,
    rootInheritDisabled?: Object,
    fullWidth?: Object,
    wrapper?: Object,
    labelContainer?: Object,
    label?: Object,
    labelWrapped?: Object,
  |};
  declare export type TabProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    classes?: TabClasses,
    className?: string,
    disabled?: boolean,
    icon?: React$Node,
    label?: React$Node,
    value?: any,
  |};
  declare var Tab: React$ComponentType<TabProps>;
  declare export default typeof Tab;
}

declare module '@material-ui/core/Tabs' {
  declare export type IndicatorColor = 'secondary' | 'primary' | string;
  declare export type ScrollButtons = 'auto' | 'on' | 'off';
  declare export type TextColor = 'secondary' | 'primary' | 'inherit';

  declare export type TabsClasses = {|
    root?: Object,
    flexContainer?: Object,
    scrollingContainer?: Object,
    fixed?: Object,
    scrollable?: Object,
    centered?: Object,
    buttonAuto?: Object,
  |};
  declare export type TabsProps = {|
    ...MUI$BaseProps,
    action?: (actions: Object) => void,
    centered?: boolean,
    children?: React$Node,
    classes?: TabsClasses,
    className?: string,
    fullWidth?: boolean,
    indicatorColor?: IndicatorColor,
    onChange?: (event: SyntheticEvent<>, value: any) => void,
    scrollable?: boolean,
    scrollButtons?: ScrollButtons,
    ScrollButtonComponent?: React$ComponentType<>,
    textColor?: TextColor,
    value: any,
  |};
  declare var Tabs: React$ComponentType<TabsProps>;
  declare export default typeof Tabs;
}

declare module '@material-ui/core/TextField' {
  import type { FormControlProps } from '@material-ui/core/FormControl';
  import type { FormHelperTextProps } from '@material-ui/core/FormHelperText';
  import type { InputProps } from '@material-ui/core/Input';
  import type { InputLabelProps } from '@material-ui/core/InputLabel';
  import type { SelectProps } from '@material-ui/core/Select';

  declare export type TextFieldProps = {|
    ...MUI$BaseProps,
    ...FormControlProps,
    autoComplete?: string,
    autoFocus?: boolean,
    className?: string,
    defaultValue?: string,
    disabled?: boolean,
    error?: boolean,
    FormHelperTextProps?: FormHelperTextProps,
    fullWidth?: boolean,
    helperText?: React$Node,
    id?: string,
    InputLabelProps?: InputLabelProps,
    InputProps?: InputProps,
    inputRef?: React$Ref<any>,
    label?: React$Node,
    margin?: 'none' | 'dense' | 'normal',
    multiline?: boolean,
    name?: string,
    onChange?: (event: SyntheticInputEvent<>) => void,
    placeholder?: string,
    required?: boolean,
    rows?: string | number,
    rowsMax?: string | number,
    select?: boolean,
    SelectProps?: SelectProps,
    type?: string,
    value?: string | number | Array<string | number>,
  |};
  declare var TextField: React$ComponentType<TextFieldProps>;
  declare export default typeof TextField;
}

declare module '@material-ui/core/Toolbar' {
  declare export type ToolbarClasses = {|
    root?: Object,
    gutters?: Object,
  |};
  declare export type ToolbarProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: ToolbarClasses,
    className?: string,
    disableGutters?: boolean
  |};
  declare var Toolbar: React$ComponentType<ToolbarProps>;
  declare export default typeof Toolbar;
}

declare module '@material-ui/core/Tooltip' {
  declare export type Placement =
    | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';

  declare export type TooltipClasses = {|
    root?: Object,
    popper?: Object,
    popperClose?: Object,
    tooltip?: Object,
    tooltipLeft?: Object,
    tooltipRight?: Object,
    tooltipTop?: Object,
    tooltipBottom?: Object,
    tooltipOpen?: Object,
  |};
  declare export type TooltipProps = {|
    ...MUI$BaseProps,
    children: React$Element<any>,
    classes?: TooltipClasses,
    className?: string,
    disableFocusListener?: boolean,
    disableHoverListener?: boolean,
    disableTouchListener?: boolean,
    enterDelay?: number,
    id?: string,
    leaveDelay?: number,
    onClose?: (event: SyntheticEvent<>) => void,
    onOpen?: (event: SyntheticEvent<>) => void,
    open?: boolean,
    placement?: Placement,
    PopperProps?: Object,
    title: React$Node,
  |};
  declare var Tooltip: React$ComponentType<TooltipProps>;
  declare export default typeof Tooltip;
}

declare module '@material-ui/core/Collapse' {
  import type { TransitionProps } from '@material-ui/core/internal/transition';

  declare export type TransitionDuration =
    | number
    | { enter?: number, exit?: number }
    | 'auto';

  declare export type CollapseClasses = {|
    container?: Object,
    entered?: Object,
    wrapper?: Object,
    wrapperInner?: Object,
  |};
  declare export type CollapseProps = {|
    ...MUI$BaseProps,
    ...TransitionProps,
    children?: React$Node,
    classes?: CollapseClasses,
    className?: String,
    collapsedHeight?: string,
    component?: React$ElementType,
    in?: boolean,
    timeout?: TransitionDuration,
  |};
  declare var Collapse: React$ComponentType<CollapseProps>;
  declare export default typeof Collapse;
}

declare module '@material-ui/core/Fade' {
  import type {
    TransitionProps,
  } from '@material-ui/core/internal/transition';

  declare export type FadeProps = {|
    ...MUI$BaseProps,
    ...TransitionProps,
    children?: React$Element<any>,
    in?: boolean,
  |};
  declare var Fade: React$ComponentType<FadeProps>;
  declare export default typeof Fade;
}

declare module '@material-ui/core/Grow' {
  import type {
    TransitionProps,
  } from '@material-ui/core/internal/transition';

  declare export type TransitionDuration =
    | number
    | { enter?: number, exit?: number }
    | 'auto';

  declare export type GrowProps = {|
    ...MUI$BaseProps,
    ...TransitionProps,
    children?: React$Element<any>,
    in?: boolean,
    timeout?: TransitionDuration
  |};
  declare var Grow: React$ComponentType<GrowProps>;
  declare export default typeof Grow;
}

declare module '@material-ui/core/Slide' {
  import type { TransitionProps } from '@material-ui/core/internal/transition';

  declare export type Direction = 'left' | 'right' | 'up' | 'down';

  declare function setTranslateValue(
    props: Object,
    node: HTMLElement | Object
  ): void;

  declare export type SlideProps = {|
    ...MUI$BaseProps,
    ...TransitionProps,
    children?: React$Node,
    direction?: Direction,
    in?: boolean,
  |};
  declare var Slide: React$ComponentType<SlideProps>;
  declare export default typeof Slide;
}

declare module '@material-ui/core/Typography' {
  declare export type Align = 'inherit' | 'left' | 'center' | 'right' | 'justify';
  declare export type Color =
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'secondary'
    | 'error'
    | 'default';
  declare export type Variant =
    | 'display4'
    | 'display3'
    | 'display2'
    | 'display1'
    | 'headline'
    | 'title'
    | 'subheading'
    | 'body2'
    | 'body1'
    | 'caption'
    | 'button';

  declare export type TypographyClasses = {|
    root?: Object,
    display4?: Object,
    display3?: Object,
    display2?: Object,
    display1?: Object,
    headline?: Object,
    title?: Object,
    subheading?: Object,
    body2?: Object,
    body1?: Object,
    caption?: Object,
    button?: Object,
    alignLeft?: Object,
    alignCenter?: Object,
    alignRight?: Object,
    alignJustify?: Object,
    noWrap?: Object,
    gutterBottom?: Object,
    paragraph?: Object,
    colorInherit?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    colorTextSecondary?: Object,
    colorError?: Object,
  |};
  declare export type TypographyProps = {|
    ...MUI$BaseProps,
    align?: Align,
    children?: React$Node,
    classes?: TypographyClasses,
    className?: string,
    color?: Color,
    component?: React$ElementType,
    gutterBottom?: boolean,
    headlineMapping?: { [key: Variant]: string },
    noWrap?: boolean,
    paragraph?: boolean,
    variant?: Variant,
  |};

  declare var Typography: React$ComponentType<TypographyProps>

  declare export default typeof Typography;
}

// declare module '@material-ui/core/utils/addEventListener' {
//   declare module.exports: (
//     node: React$Node,
//     event: string,
//     handler: EventHandler,
//     capture?: boolean
//   ) => any;
// }

declare module '@material-ui/core/ClickAwayListener' {
  declare export type ClickAwayListenerProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    onClickAway: (event: SyntheticEvent<>) => void
  |};
  declare var ClickAwayListener: React$ComponentType<ClickAwayListenerProps>;
  declare export default typeof ClickAwayListener;
}

declare module '@material-ui/core/utils/exactProp' {
  declare function exactProp (
    propTypes: Object,
    componentNameInError: string
  ): any;

  declare export default typeof exactProp;
}

declare module '@material-ui/core/utils/helpers' {
  declare module.exports: {
    capitalize: Function,
    contains: (obj: Object, pred: Object) => any,
    findIndex: (arr: Array<any>, pred: any) => any,
    find: (arr: Array<any>, pred: any) => any,
    createChainedFunction: (...funcs: Array<any>) => any
  };
}

// declare module '@material-ui/core/utils/keyboardFocus' {
//   declare module.exports: {
//     focusKeyPressed: Function,
//     detectKeyboardFocus: Function,
//     listenForFocusKeys: Function
//   };
// }

// declare module '@material-ui/core/utils/manageAriaHidden' {
//   declare module.exports: {
//     ariaHidden: Function,
//     hideSiblings: Function,
//     showSiblings: Function
//   };
// }

declare module '@material-ui/core/utils/reactHelpers' {
  declare module.exports: {
    cloneChildrenWithClassName: (
      children?: React$Node,
      className: string
    ) => any,
    isMuiElement: (element: any, muiNames: Array<string>) => any,
    isMuiComponent: (element: any, muiNames: Array<string>) => any
  };
}

declare module '@material-ui/core/utils/requirePropFactory' {
  declare function requirePropFactory (componentNameInError: string): any;

  declare export default typeof requirePropFactory;
}

declare module '@material-ui/core/withWidth' {
  declare function withWidth (
    options: Object
  ): <Props: {}>(
    Component: React$ComponentType<Props>
  ) => React$ComponentType<Props>;

  declare export default typeof withWidth;
}

// Filename aliases
declare module '@material-ui/core/AppBar.js' {
  declare module.exports: $Exports<'@material-ui/core/AppBar'>;
}
declare module '@material-ui/core/AppBar/index.js' {
  declare module.exports: $Exports<'@material-ui/core/AppBar'>;
}
declare module '@material-ui/core/Avatar/Avatar.js' {
  declare module.exports: $Exports<'@material-ui/core/Avatar'>;
}
declare module '@material-ui/core/Avatar/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Avatar'>;
}
declare module '@material-ui/core/Badge/Badge.js' {
  declare module.exports: $Exports<'@material-ui/core/Badge'>;
}
declare module '@material-ui/core/Badge/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Badge'>;
}
declare module '@material-ui/core/BottomNavigation/BottomNavigation.js' {
  declare module.exports: $Exports<
    '@material-ui/core/BottomNavigation'
  >;
}
declare module '@material-ui/core/BottomNavigation/BottomNavigationAction.js' {
  declare module.exports: $Exports<
    '@material-ui/core/BottomNavigationAction'
  >;
}
declare module '@material-ui/core/BottomNavigation/index.js' {
  declare module.exports: $Exports<'@material-ui/core/BottomNavigation'>;
}
declare module '@material-ui/core/Button/Button.js' {
  declare module.exports: $Exports<'@material-ui/core/Button'>;
}
declare module '@material-ui/core/Button/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Button'>;
}
declare module '@material-ui/core/ButtonBase/ButtonBase.js' {
  declare module.exports: $Exports<'@material-ui/core/ButtonBase'>;
}
declare module '@material-ui/core/ButtonBase/createRippleHandler.js' {
  declare module.exports: $Exports<
    '@material-ui/core/ButtonBase/createRippleHandler'
  >;
}
declare module '@material-ui/core/ButtonBase/index.js' {
  declare module.exports: $Exports<'@material-ui/core/ButtonBase'>;
}
declare module '@material-ui/core/ButtonBase/Ripple.js' {
  declare module.exports: $Exports<'@material-ui/core/ButtonBase/Ripple'>;
}
declare module '@material-ui/core/ButtonBase/TouchRipple.js' {
  declare module.exports: $Exports<'@material-ui/core/ButtonBase/TouchRipple'>;
}
declare module '@material-ui/core/Card/Card.js' {
  declare module.exports: $Exports<'@material-ui/core/Card'>;
}
declare module '@material-ui/core/CardActions/CardActions.js' {
  declare module.exports: $Exports<'@material-ui/core/CardActions'>;
}
declare module '@material-ui/core/CardContent/CardContent.js' {
  declare module.exports: $Exports<'@material-ui/core/CardContent'>;
}
declare module '@material-ui/core/CardHeader/CardHeader.js' {
  declare module.exports: $Exports<'@material-ui/core/CardHeader'>;
}
declare module '@material-ui/core/CardMedia/CardMedia.js' {
  declare module.exports: $Exports<'@material-ui/core/CardMedia'>;
}
declare module '@material-ui/core/Card/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Card'>;
}
declare module '@material-ui/core/Checkbox/Checkbox.js' {
  declare module.exports: $Exports<'@material-ui/core/Checkbox'>;
}
declare module '@material-ui/core/Checkbox/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Checkbox'>;
}
declare module '@material-ui/core/Chip/Chip.js' {
  declare module.exports: $Exports<'@material-ui/core/Chip'>;
}
declare module '@material-ui/core/Chip/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Chip'>;
}
declare module '@material-ui/core/colors/amber.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/amber'>;
}
declare module '@material-ui/core/colors/blue.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/blue'>;
}
declare module '@material-ui/core/colors/blueGrey.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/blueGrey'>;
}
declare module '@material-ui/core/colors/brown.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/brown'>;
}
declare module '@material-ui/core/colors/common.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/common'>;
}
declare module '@material-ui/core/colors/cyan.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/cyan'>;
}
declare module '@material-ui/core/colors/deepOrange.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/deepOrange'>;
}
declare module '@material-ui/core/colors/deepPurple.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/deepPurple'>;
}
declare module '@material-ui/core/colors/green.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/green'>;
}
declare module '@material-ui/core/colors/grey.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/grey'>;
}
declare module '@material-ui/core/colors/index.js' {
  declare module.exports: $Exports<'@material-ui/core/colors'>;
}
declare module '@material-ui/core/colors/indigo.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/indigo'>;
}
declare module '@material-ui/core/colors/lightBlue.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/lightBlue'>;
}
declare module '@material-ui/core/colors/lightGreen.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/lightGreen'>;
}
declare module '@material-ui/core/colors/lime.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/lime'>;
}
declare module '@material-ui/core/colors/orange.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/orange'>;
}
declare module '@material-ui/core/colors/pink.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/pink'>;
}
declare module '@material-ui/core/colors/purple.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/purple'>;
}
declare module '@material-ui/core/colors/red.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/red'>;
}
declare module '@material-ui/core/colors/teal.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/teal'>;
}
declare module '@material-ui/core/colors/yellow.js' {
  declare module.exports: $Exports<'@material-ui/core/colors/yellow'>;
}
declare module '@material-ui/core/Dialog/Dialog.js' {
  declare module.exports: $Exports<'@material-ui/core/Dialog'>;
}
declare module '@material-ui/core/DialogActions/DialogActions.js' {
  declare module.exports: $Exports<'@material-ui/core/DialogActions'>;
}
declare module '@material-ui/core/DialogContent/DialogContent.js' {
  declare module.exports: $Exports<'@material-ui/core/DialogContent'>;
}
declare module '@material-ui/core/DialogContentText/DialogContentText.js' {
  declare module.exports: $Exports<'@material-ui/core/DialogContentText'>;
}
declare module '@material-ui/core/DialogTitle/DialogTitle.js' {
  declare module.exports: $Exports<'@material-ui/core/DialogTitle'>;
}
declare module '@material-ui/core/Dialog/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Dialog'>;
}
declare module '@material-ui/core/withMobileDialog/withMobileDialog.js' {
  declare module.exports: $Exports<'@material-ui/core/withMobileDialog'>;
}
declare module '@material-ui/core/Divider.js' {
  declare module.exports: $Exports<'@material-ui/core/Divider'>;
}
declare module '@material-ui/core/Divider/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Divider'>;
}
declare module '@material-ui/core/Drawer.js' {
  declare module.exports: $Exports<'@material-ui/core/Drawer'>;
}
declare module '@material-ui/core/Drawer/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Drawer'>;
}
declare module '@material-ui/core/ExpansionPanel/ExpansionPanel.js' {
  declare module.exports: $Exports<'@material-ui/core/ExpansionPanel'>;
}
declare module '@material-ui/core/ExpansionPanelActions/ExpansionPanelActions.js' {
  declare module.exports: $Exports<
    '@material-ui/core/ExpansionPanelActions'
  >;
}
declare module '@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails.js' {
  declare module.exports: $Exports<
    '@material-ui/core/ExpansionPanelDetails'
  >;
}
declare module '@material-ui/core/ExpansionPanelSummary/ExpansionPanelSummary.js' {
  declare module.exports: $Exports<
    '@material-ui/core/ExpansionPanelSummary'
  >;
}
declare module '@material-ui/core/ExpansionPanel/index.js' {
  declare module.exports: $Exports<'@material-ui/core/ExpansionPanel'>;
}
declare module '@material-ui/core/FormControl/FormControl.js' {
  declare module.exports: $Exports<'@material-ui/core/FormControl'>;
}
declare module '@material-ui/core/FormControlLabel/FormControlLabel.js' {
  declare module.exports: $Exports<'@material-ui/core/FormControlLabel'>;
}
declare module '@material-ui/core/FormGroup/FormGroup.js' {
  declare module.exports: $Exports<'@material-ui/core/FormGroup'>;
}
declare module '@material-ui/core/FormHelperText/FormHelperText.js' {
  declare module.exports: $Exports<'@material-ui/core/FormHelperText'>;
}
declare module '@material-ui/core/FormLabel/FormLabel.js' {
  declare module.exports: $Exports<'@material-ui/core/FormLabel'>;
}
declare module '@material-ui/core/Grid/Grid.js' {
  declare module.exports: $Exports<'@material-ui/core/Grid'>;
}
declare module '@material-ui/core/Grid/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Grid'>;
}
declare module '@material-ui/core/GridList/GridList.js' {
  declare module.exports: $Exports<'@material-ui/core/GridList'>;
}
declare module '@material-ui/core/GridListTitle/GridListTile.js' {
  declare module.exports: $Exports<'@material-ui/core/GridListTile'>;
}
declare module '@material-ui/core/GridListTitleBar/GridListTileBar.js' {
  declare module.exports: $Exports<'@material-ui/core/GridListTileBar'>;
}
declare module '@material-ui/core/GridList/index.js' {
  declare module.exports: $Exports<'@material-ui/core/GridList'>;
}
declare module '@material-ui/core/Hidden/Hidden.js' {
  declare module.exports: $Exports<'@material-ui/core/Hidden'>;
}
declare module '@material-ui/core/Hidden/HiddenCss.js' {
  declare module.exports: $Exports<'@material-ui/core/Hidden/HiddenCss'>;
}
declare module '@material-ui/core/Hidden/HiddenJs.js' {
  declare module.exports: $Exports<'@material-ui/core/Hidden/HiddenJs'>;
}
declare module '@material-ui/core/Hidden/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Hidden'>;
}
// declare module '@material-ui/core/Hidden/types.js' {
//   declare module.exports: $Exports<'@material-ui/core/Hidden/types'>;
// }
declare module '@material-ui/core/Icon/Icon.js' {
  declare module.exports: $Exports<'@material-ui/core/Icon'>;
}
declare module '@material-ui/core/Icon/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Icon'>;
}
declare module '@material-ui/core/IconButton/IconButton.js' {
  declare module.exports: $Exports<'@material-ui/core/IconButton'>;
}
declare module '@material-ui/core/IconButton/index.js' {
  declare module.exports: $Exports<'@material-ui/core/IconButton'>;
}
declare module '@material-ui/core/Input/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Input'>;
}
declare module '@material-ui/core/Input/Input.js' {
  declare module.exports: $Exports<'@material-ui/core/Input'>;
}
declare module '@material-ui/core/InputAdornment/InputAdornment.js' {
  declare module.exports: $Exports<'@material-ui/core/InputAdornment'>;
}
declare module '@material-ui/core/InputLabel/InputLabel.js' {
  declare module.exports: $Exports<'@material-ui/core/InputLabel'>;
}
declare module '@material-ui/core/Input/Textarea.js' {
  declare module.exports: $Exports<'@material-ui/core/Input/Textarea'>;
}
declare module '@material-ui/core/Portal/Portal.js' {
  declare module.exports: $Exports<'@material-ui/core/Portal'>;
}
declare module '@material-ui/core/internal/transition.js' {
  declare module.exports: $Exports<'@material-ui/core/internal/transition'>;
}
declare module '@material-ui/core/List/index.js' {
  declare module.exports: $Exports<'@material-ui/core/List'>;
}
declare module '@material-ui/core/List/List.js' {
  declare module.exports: $Exports<'@material-ui/core/List'>;
}
declare module '@material-ui/core/ListItem/ListItem.js' {
  declare module.exports: $Exports<'@material-ui/core/ListItem'>;
}
declare module '@material-ui/core/ListItemAvatar/ListItemAvatar.js' {
  declare module.exports: $Exports<'@material-ui/core/ListItemAvatar'>;
}
declare module '@material-ui/core/ListItemIcon/ListItemIcon.js' {
  declare module.exports: $Exports<'@material-ui/core/ListItemIcon'>;
}
declare module '@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction.js' {
  declare module.exports: $Exports<'@material-ui/core/ListItemSecondaryAction'>;
}
declare module '@material-ui/core/ListItemText/ListItemText.js' {
  declare module.exports: $Exports<'@material-ui/core/ListItemText'>;
}
declare module '@material-ui/core/ListItemSubheader/ListSubheader.js' {
  declare module.exports: $Exports<'@material-ui/core/ListSubheader'>;
}
declare module '@material-ui/core/Menu/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Menu'>;
}
declare module '@material-ui/core/Menu/Menu.js' {
  declare module.exports: $Exports<'@material-ui/core/Menu'>;
}
declare module '@material-ui/core/MenuItem/MenuItem.js' {
  declare module.exports: $Exports<'@material-ui/core/MenuItem'>;
}
declare module '@material-ui/core/MenuList/MenuList.js' {
  declare module.exports: $Exports<'@material-ui/core/MenuList'>;
}
declare module '@material-ui/core/MobileStepper/index.js' {
  declare module.exports: $Exports<'@material-ui/core/MobileStepper'>;
}
declare module '@material-ui/core/MobileStepper/MobileStepper.js' {
  declare module.exports: $Exports<'@material-ui/core/MobileStepper'>;
}
declare module '@material-ui/core/Backdrop/Backdrop.js' {
  declare module.exports: $Exports<'@material-ui/core/Backdrop'>;
}
declare module '@material-ui/core/Modal/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Modal'>;
}
declare module '@material-ui/core/Modal/Modal.js' {
  declare module.exports: $Exports<'@material-ui/core/Modal'>;
}
declare module '@material-ui/core/Modal/ModalManager.js' {
  declare module.exports: $Exports<'@material-ui/core/Modal/ModalManager'>;
}
declare module '@material-ui/core/Paper/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Paper'>;
}
declare module '@material-ui/core/Paper/Paper.js' {
  declare module.exports: $Exports<'@material-ui/core/Paper'>;
}
declare module '@material-ui/core/Popover/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Popover'>;
}
declare module '@material-ui/core/Popover/Popover.js' {
  declare module.exports: $Exports<'@material-ui/core/Popover'>;
}
declare module '@material-ui/core/CircularProgress/CircularProgress.js' {
  declare module.exports: $Exports<'@material-ui/core/CircularProgress'>;
}
declare module '@material-ui/core/LinearProgress/LinearProgress.js' {
  declare module.exports: $Exports<'@material-ui/core/LinearProgress'>;
}
declare module '@material-ui/core/Radio/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Radio'>;
}
declare module '@material-ui/core/Radio/Radio.js' {
  declare module.exports: $Exports<'@material-ui/core/Radio'>;
}
declare module '@material-ui/core/RadioGroup/RadioGroup.js' {
  declare module.exports: $Exports<'@material-ui/core/RadioGroup'>;
}
declare module '@material-ui/core/Select/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Select'>;
}
declare module '@material-ui/core/Select/Select.js' {
  declare module.exports: $Exports<'@material-ui/core/Select'>;
}
declare module '@material-ui/core/Select/SelectInput.js' {
  declare module.exports: $Exports<'@material-ui/core/Select/SelectInput'>;
}
declare module '@material-ui/core/Snackbar/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Snackbar'>;
}
declare module '@material-ui/core/Snackbar/Snackbar.js' {
  declare module.exports: $Exports<'@material-ui/core/Snackbar'>;
}
declare module '@material-ui/core/SnackbarContent/SnackbarContent.js' {
  declare module.exports: $Exports<'@material-ui/core/SnackbarContent'>;
}
declare module '@material-ui/core/Stepper/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Stepper'>;
}
declare module '@material-ui/core/Step/Step.js' {
  declare module.exports: $Exports<'@material-ui/core/Step'>;
}
declare module '@material-ui/core/StepButton/StepButton.js' {
  declare module.exports: $Exports<'@material-ui/core/StepButton'>;
}
declare module '@material-ui/core/StepContent/StepContent.js' {
  declare module.exports: $Exports<'@material-ui/core/StepContent'>;
}
declare module '@material-ui/core/StepIcon/StepIcon.js' {
  declare module.exports: $Exports<'@material-ui/core/StepIcon'>;
}
declare module '@material-ui/core/StepLabel/StepLabel.js' {
  declare module.exports: $Exports<'@material-ui/core/StepLabel'>;
}
declare module '@material-ui/core/Stepper/Stepper.js' {
  declare module.exports: $Exports<'@material-ui/core/Stepper'>;
}
declare module '@material-ui/core/styles/colorManipulator.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/colorManipulator'>;
}
declare module '@material-ui/core/styles/createBreakpoints.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/createBreakpoints'>;
}
declare module '@material-ui/core/styles/createGenerateClassName.js' {
  declare module.exports: $Exports<
    '@material-ui/core/styles/createGenerateClassName'
  >;
}
declare module '@material-ui/core/styles/createMixins.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/createMixins'>;
}
declare module '@material-ui/core/styles/createMuiTheme.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/createMuiTheme'>;
}
declare module '@material-ui/core/styles/createPalette.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/createPalette'>;
}
declare module '@material-ui/core/styles/createTypography.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/createTypography'>;
}
declare module '@material-ui/core/styles/getStylesCreator.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/getStylesCreator'>;
}
declare module '@material-ui/core/styles/index.js' {
  declare module.exports: $Exports<'@material-ui/core/styles'>;
}
declare module '@material-ui/core/styles/MuiThemeProvider.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/MuiThemeProvider'>;
}
declare module '@material-ui/core/styles/shadows.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/shadows'>;
}
declare module '@material-ui/core/styles/spacing.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/spacing'>;
}
declare module '@material-ui/core/styles/themeListener.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/themeListener'>;
}
declare module '@material-ui/core/styles/transitions.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/transitions'>;
}
declare module '@material-ui/core/styles/withStyles.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/withStyles'>;
}
declare module '@material-ui/core/styles/withTheme.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/withTheme'>;
}
declare module '@material-ui/core/styles/zIndex.js' {
  declare module.exports: $Exports<'@material-ui/core/styles/zIndex'>;
}
declare module '@material-ui/icons/ArrowDownward.js' {
  declare module.exports: $Exports<'@material-ui/icons/ArrowDownward'>;
}
declare module '@material-ui/icons/ArrowDropDown.js' {
  declare module.exports: $Exports<'@material-ui/icons/ArrowDropDown'>;
}
declare module '@material-ui/icons/Cancel.js' {
  declare module.exports: $Exports<'@material-ui/icons/Cancel'>;
}
declare module '@material-ui/icons/CheckBox.js' {
  declare module.exports: $Exports<'@material-ui/icons/CheckBox'>;
}
declare module '@material-ui/icons/CheckBoxOutlineBlank.js' {
  declare module.exports: $Exports<
    '@material-ui/icons/CheckBoxOutlineBlank'
  >;
}
declare module '@material-ui/icons/CheckCircle.js' {
  declare module.exports: $Exports<'@material-ui/icons/CheckCircle'>;
}
declare module '@material-ui/icons/IndeterminateCheckBox.js' {
  declare module.exports: $Exports<
    '@material-ui/icons/IndeterminateCheckBox'
  >;
}
declare module '@material-ui/icons/KeyboardArrowLeft.js' {
  declare module.exports: $Exports<'@material-ui/icons/KeyboardArrowLeft'>;
}
declare module '@material-ui/icons/KeyboardArrowRight.js' {
  declare module.exports: $Exports<'@material-ui/icons/KeyboardArrowRight'>;
}
declare module '@material-ui/icons/RadioButtonChecked.js' {
  declare module.exports: $Exports<'@material-ui/icons/RadioButtonChecked'>;
}
declare module '@material-ui/icons/RadioButtonUnchecked.js' {
  declare module.exports: $Exports<
    '@material-ui/icons/RadioButtonUnchecked'
  >;
}
declare module '@material-ui/core/SvgIcon/index.js' {
  declare module.exports: $Exports<'@material-ui/core/SvgIcon'>;
}
declare module '@material-ui/core/SvgIcon/SvgIcon.js' {
  declare module.exports: $Exports<'@material-ui/core/SvgIcon'>;
}
declare module '@material-ui/core/Switch/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Switch'>;
}
declare module '@material-ui/core/Switch/Switch.js' {
  declare module.exports: $Exports<'@material-ui/core/Switch'>;
}
declare module '@material-ui/core/Table/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Table'>;
}
declare module '@material-ui/core/Table/Table.js' {
  declare module.exports: $Exports<'@material-ui/core/Table'>;
}
declare module '@material-ui/core/TableBody/TableBody.js' {
  declare module.exports: $Exports<'@material-ui/core/TableBody'>;
}
declare module '@material-ui/core/TableCell/TableCell.js' {
  declare module.exports: $Exports<'@material-ui/core/TableCell'>;
}
declare module '@material-ui/core/TableFooter/TableFooter.js' {
  declare module.exports: $Exports<'@material-ui/core/TableFooter'>;
}
declare module '@material-ui/core/TableHead/TableHead.js' {
  declare module.exports: $Exports<'@material-ui/core/TableHead'>;
}
declare module '@material-ui/core/TablePagination/TablePagination.js' {
  declare module.exports: $Exports<'@material-ui/core/TablePagination'>;
}
declare module '@material-ui/core/TableRow/TableRow.js' {
  declare module.exports: $Exports<'@material-ui/core/TableRow'>;
}
declare module '@material-ui/core/TableSortLabel/TableSortLabel.js' {
  declare module.exports: $Exports<'@material-ui/core/TableSortLabel'>;
}
declare module '@material-ui/core/Tabs/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Tabs'>;
}
declare module '@material-ui/core/Tab/Tab.js' {
  declare module.exports: $Exports<'@material-ui/core/Tab'>;
}
declare module '@material-ui/core/Tabs/Tabs.js' {
  declare module.exports: $Exports<'@material-ui/core/Tabs'>;
}
declare module '@material-ui/core/TextField/index.js' {
  declare module.exports: $Exports<'@material-ui/core/TextField'>;
}
declare module '@material-ui/core/TextField/TextField.js' {
  declare module.exports: $Exports<'@material-ui/core/TextField'>;
}
declare module '@material-ui/core/Toolbar/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Toolbar'>;
}
declare module '@material-ui/core/Toolbar/Toolbar.js' {
  declare module.exports: $Exports<'@material-ui/core/Toolbar'>;
}
declare module '@material-ui/core/Tooltip/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Tooltip'>;
}
declare module '@material-ui/core/Tooltip/Tooltip.js' {
  declare module.exports: $Exports<'@material-ui/core/Tooltip'>;
}
declare module '@material-ui/core/Collapse/Collapse.js' {
  declare module.exports: $Exports<'@material-ui/core/Collapse'>;
}
declare module '@material-ui/core/Fade/Fade.js' {
  declare module.exports: $Exports<'@material-ui/core/Fade'>;
}
declare module '@material-ui/core/Grow/Grow.js' {
  declare module.exports: $Exports<'@material-ui/core/Grow'>;
}
declare module '@material-ui/core/Slide/Slide.js' {
  declare module.exports: $Exports<'@material-ui/core/Slide'>;
}
declare module '@material-ui/core/Typography/index.js' {
  declare module.exports: $Exports<'@material-ui/core/Typography'>;
}
declare module '@material-ui/core/Typography/Typography.js' {
  declare module.exports: $Exports<'@material-ui/core/Typography'>;
}
// declare module '@material-ui/core/utils/addEventListener.js' {
//   declare module.exports: $Exports<'@material-ui/core/utils/addEventListener'>;
// }
declare module '@material-ui/core/ClickAwayListener/ClickAwayListener.js' {
  declare module.exports: $Exports<'@material-ui/core/ClickAwayListener'>;
}
declare module '@material-ui/core/utils/exactProp.js' {
  declare module.exports: $Exports<'@material-ui/core/utils/exactProp'>;
}
declare module '@material-ui/core/utils/helpers.js' {
  declare module.exports: $Exports<'@material-ui/core/utils/helpers'>;
}
// declare module '@material-ui/core/utils/keyboardFocus.js' {
//   declare module.exports: $Exports<'@material-ui/core/utils/keyboardFocus'>;
// }
// declare module '@material-ui/core/utils/manageAriaHidden.js' {
//   declare module.exports: $Exports<'@material-ui/core/utils/manageAriaHidden'>;
// }
declare module '@material-ui/core/utils/reactHelpers.js' {
  declare module.exports: $Exports<'@material-ui/core/utils/reactHelpers'>;
}
declare module '@material-ui/core/utils/requirePropFactory.js' {
  declare module.exports: $Exports<'@material-ui/core/utils/requirePropFactory'>;
}
declare module '@material-ui/core/withWidth/withWidth.js' {
  declare module.exports: $Exports<'@material-ui/core/withWidth'>;
}
