/* @flow */
/* eslint-disable */

declare type MUI$BaseProps = {|
  'aria-owns'?: ?string,
  'aria-haspopup'?: ?string,
  'aria-label'?: ?string,
  id?: ?string,
|};

declare module 'material-ui/AppBar/AppBar' {
  declare type Color = 'inherit' | 'primary' | 'secondary' | 'default';
  declare type Position = 'fixed' | 'absolute' | 'sticky' | 'static';

  declare type AppBarClasses = {|
    root?: Object,
    positionFixed?: Object,
    positionAbsolute?: Object,
    positionSticky?: Object,
    positionStatic?: Object,
    colorDefault?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
  |};
  declare type AppBarProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: AppBarClasses,
    color?: Color,
    position?: Position
  |};
  declare module.exports: React$ComponentType<AppBarProps>;
}

declare module 'material-ui/AppBar' {
  declare module.exports: $Exports<'material-ui/AppBar/AppBar'>;
}

declare module 'material-ui/Avatar/Avatar' {
  declare type AvatarClasses = {|
    root?: Object,
    colorDefault?: Object,
    img?: Object,
  |};
  declare type AvatarProps = {|
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
  declare module.exports: React$ComponentType<AvatarProps>;
}

declare module 'material-ui/Avatar' {
  declare module.exports: $Exports<'material-ui/Avatar/Avatar'>;
}

declare module 'material-ui/Backdrop/Backdrop' {
  import type { TransitionDuration } from 'material-ui/internal/transition';

  declare type BackdropClasses = {|
    root?: Object,
    invisible?: Object,
  |};
  declare type BackdropProps = {|
    ...MUI$BaseProps,
    className?: string,
    classes?: BackdropClasses,
    invisible?: boolean,
    open: boolean,
    transitionDuration?: TransitionDuration,
  |};
  declare module.exports: React$ComponentType<BackdropProps>;
}

declare module 'material-ui/Backdrop' {
  declare module.exports: $Exports<'material-ui/Backdrop/Backdrop'>;
}

declare module 'material-ui/Badge/Badge' {
  declare type Color = 'default' | 'primary' | 'secondary';

  declare type BadgeClasses = {|
    root?: Object,
    badge?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    colorError?: Object,
  |};
  declare type BadgeProps = {|
    ...MUI$BaseProps,
    badgeContent: React$Node,
    children: React$Node,
    className?: string,
    classes?: BadgeClasses,
    color?: Color,
    component?: React$ElementType,
  |};
  declare module.exports: React$ComponentType<BadgeProps>;
}

declare module 'material-ui/Badge' {
  declare module.exports: $Exports<'material-ui/Badge/Badge'>;
}

declare module 'material-ui/BottomNavigation/BottomNavigation' {
  declare type BottomNavigationClasses = {|
    root?: Object,
  |};
  declare type BottomNavigationProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: BottomNavigationClasses,
    onChange?: Function,
    showLabels?: boolean,
    value: any
  |};
  declare module.exports: React$ComponentType<BottomNavigationProps>;
}

declare module 'material-ui/BottomNavigation/BottomNavigationAction' {
  import type { ButtonBaseProps } from 'material-ui/ButtonBase/ButtonBase';
  declare type BottomNavigationActionClasses = {|
    root?: Object,
    selected?: Object,
    selectedIconOnly?: Object,
    wrapper?: Object,
    label?: Object,
    selectedLabel?: Object,
    hiddenLabel?: Object,
  |};
  declare type BottomNavigationActionProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    className?: string,
    classes?: BottomNavigationActionClasses,
    icon?: React$Node,
    label?: React$Node,
    showLabel?: boolean,
    value?: any
  |};
  declare module.exports: React$ComponentType<BottomNavigationActionProps>;
}

declare module 'material-ui/BottomNavigation' {
  declare module.exports: {
    BottomNavigationAction: $Exports<
      'material-ui/BottomNavigation/BottomNavigationAction'
    >,
    default: $Exports<'material-ui/BottomNavigation/BottomNavigation'>
  };
}

declare module 'material-ui/Button/Button' {
  import type { ButtonBaseProps } from 'material-ui/ButtonBase/ButtonBase';
  declare type Color = 'default' | 'inherit' | 'primary' | 'secondary';
  declare type ButtonSize = 'small' | 'medium' | 'large';
  declare type ButtonVariant = 'flat' | 'raised' | 'fab';

  declare type ButtonClasses = {|
    root?: Object,
    label?: Object,
    flatPrimary?: Object,
    flatSecondary?: Object,
    colorInherit?: Object,
    raised?: Object,
    keyboardFocused?: Object,
    raisedPrimary?: Object,
    raisedSecondary?: Object,
    disabled?: Object,
    fab?: Object,
    mini?: Object,
    sizeSmall?: Object,
    sizeLarge?: Object,
    fullWidth?: Object,
  |};
  declare type ButtonProps = {|
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
    variant?: ButtonVariant
  |};
  declare module.exports: React$ComponentType<ButtonProps>;
}

declare module 'material-ui/Button' {
  declare module.exports: $Exports<'material-ui/Button/Button'>;
}

declare module 'material-ui/ButtonBase/ButtonBase' {
  declare type ButtonBaseClasses = {|
    root?: Object,
    disabled?: Object,
  |};
  declare type ButtonBaseProps = {|
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
    onKeyboardFocus?: (event: SyntheticEvent<>) => void,

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
  declare module.exports: React$ComponentType<ButtonBaseProps>;
}

declare module 'material-ui/ButtonBase/createRippleHandler' {
  declare function handleEvent(event: SyntheticUIEvent<>): void;
  declare module.exports: (
    instance: Object,
    eventName: string,
    action: string,
    cb: ?Function
  ) => handleEvent;
}

declare module 'material-ui/ButtonBase' {
  declare module.exports: $Exports<'material-ui/ButtonBase/ButtonBase'>;
}

declare module 'material-ui/ButtonBase/Ripple' {
  declare module.exports: React$ComponentType<{|
    className?: string,
    classes?: Object,
    pulsate?: boolean,
    rippleSize: number,
    rippleX: number,
    rippleY: number
  |}>;
}

declare module 'material-ui/ButtonBase/TouchRipple' {
  declare module.exports: React$ComponentType<{|
    center?: boolean,
    className?: string,
    classes?: Object
  |}>;
}

declare module 'material-ui/Card/Card' {
  declare type CardProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    raised?: boolean
  |};
  declare module.exports: React$ComponentType<CardProps>;
}

declare module 'material-ui/Card/CardActions' {
  declare type CardActionsClasses = {|
    root?: Object,
    action?: Object,
  |};
  declare type CardActionsProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: CardActionsClasses,
    disableActionSpacing?: boolean
  |};
  declare module.exports: React$ComponentType<CardActionsProps>;
}

declare module 'material-ui/Card/CardContent' {
  declare type CardContentClasses = {|
    root?: Object,
  |};
  declare type CardContentProps = {|
    ...MUI$BaseProps,
    className?: string,
    classes?: CardContentClasses,
    component?: React$ElementType,
  |};
  declare module.exports: React$ComponentType<CardContentProps>;
}

declare module 'material-ui/Card/CardHeader' {
  declare type CardHeaderClasses = {|
    root?: Object,
    avatar?: Object,
    action?: Object,
    content?: Object,
    title?: Object,
    subheader?: Object,
  |};
  declare type CardHeaderProps = {|
    ...MUI$BaseProps,
    action?: React$Node,
    avatar?: React$Node,
    className?: string,
    classes?: CardHeaderClasses,
    component?: React$ElementType,
    subheader?: React$Node,
    title?: React$Node
  |};
  declare module.exports: React$ComponentType<CardHeaderProps>;
}

declare module 'material-ui/Card/CardMedia' {
  declare type CardMediaClasses = {|
    root?: Object,
    rootMedia?: Object,
  |};
  declare type CardMediaProps = {|
    ...MUI$BaseProps,
    className?: string,
    classes?: CardMediaClasses,
    component?: React$ElementType,
    image?: string,
    src?: string,
  |};
  declare module.exports: React$ComponentType<CardMediaProps>;
}

declare module 'material-ui/Card' {
  declare module.exports: {
    CardActions: $Exports<'material-ui/Card/CardActions'>,
    CardContent: $Exports<'material-ui/Card/CardContent'>,
    CardHeader: $Exports<'material-ui/Card/CardHeader'>,
    CardMedia: $Exports<'material-ui/Card/CardMedia'>,
    default: $Exports<'material-ui/Card/Card'>
  };
}

declare module 'material-ui/Checkbox/Checkbox' {
  declare type Color = 'primary' | 'secondary';
  declare type CheckboxClasses = {|
    default?: Object,
    checked?: Object,
    checkedPrimary?: Object,
    checkedSecondary?: Object,
    disabled?: Object,
  |};
  declare type CheckboxProps = {|
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
  declare module.exports: React$ComponentType<CheckboxProps>;
}

declare module 'material-ui/Checkbox' {
  declare module.exports: $Exports<'material-ui/Checkbox/Checkbox'>;
}

declare module 'material-ui/Chip/Chip' {
  import typeof Avatar from 'material-ui/Avatar/Avatar';

  declare type ChipClasses = {|
    root?: Object,
    clickable?: Object,
    deletable?: Object,
    avatar?: Object,
    avatarChildren?: Object,
    label?: Object,
    deleteIcon?: Object,
  |};
  declare type ChipProps = {|
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
  declare module.exports: React$ComponentType<ChipProps>;
}

declare module 'material-ui/Chip' {
  declare module.exports: $Exports<'material-ui/Chip/Chip'>;
}

declare module 'material-ui/colors/amber' {
  declare module.exports: any;
}

declare module 'material-ui/colors/blue' {
  declare module.exports: any;
}

declare module 'material-ui/colors/blueGrey' {
  declare module.exports: any;
}

declare module 'material-ui/colors/brown' {
  declare module.exports: any;
}

declare module 'material-ui/colors/common' {
  declare module.exports: any;
}

declare module 'material-ui/colors/cyan' {
  declare module.exports: any;
}

declare module 'material-ui/colors/deepOrange' {
  declare module.exports: any;
}

declare module 'material-ui/colors/deepPurple' {
  declare module.exports: any;
}

declare module 'material-ui/colors/green' {
  declare module.exports: any;
}

declare module 'material-ui/colors/grey' {
  declare module.exports: any;
}

declare module 'material-ui/colors' {
  declare module.exports: any;
}

declare module 'material-ui/colors/indigo' {
  declare module.exports: any;
}

declare module 'material-ui/colors/lightBlue' {
  declare module.exports: any;
}

declare module 'material-ui/colors/lightGreen' {
  declare module.exports: any;
}

declare module 'material-ui/colors/lime' {
  declare module.exports: any;
}

declare module 'material-ui/colors/orange' {
  declare module.exports: any;
}

declare module 'material-ui/colors/pink' {
  declare module.exports: any;
}

declare module 'material-ui/colors/purple' {
  declare module.exports: any;
}

declare module 'material-ui/colors/red' {
  declare module.exports: any;
}

declare module 'material-ui/colors/teal' {
  declare module.exports: any;
}

declare module 'material-ui/colors/yellow' {
  declare module.exports: any;
}

declare module 'material-ui/Dialog/Dialog' {
  import type { PaperProps } from 'material-ui/Paper/Paper';
  import type {
    TransitionCallback,
    TransitionDuration
  } from 'material-ui/internal/transition';
  declare type MaxWidth = 'xs' | 'sm' | 'md' | false;

  declare type DialogClasses = {|
    root?: Object,
    paper?: Object,
    paperWidthXs?: Object,
    paperWidthSm?: Object,
    paperWidthMd?: Object,
    fullWidth?: Object,
    fullScreen?: Object,
  |};
  declare type DialogProps = {|
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
    transition?: React$ComponentType<*>,
    transitionDuration?: TransitionDuration
  |};
  declare module.exports: React$ComponentType<DialogProps>;
}

declare module 'material-ui/Dialog/DialogActions' {
  declare type DialogActionsClasses = {|
    root?: Object,
    action?: Object,
    button?: Object,
  |};
  declare type DialogActionsProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: DialogActionsClasses
  |};
  declare module.exports: React$ComponentType<DialogActionsProps>;
}

declare module 'material-ui/Dialog/DialogContent' {
  declare type DialogContentClasses = {|
    root?: Object,
  |};
  declare type DialogContentProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: DialogContentClasses
  |};
  declare module.exports: React$ComponentType<DialogContentProps>;
}

declare module 'material-ui/Dialog/DialogContentText' {
  declare type DialogContentClasses = {|
    root?: Object,
  |};
  declare type DialogContentTextProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: DialogContentClasses
  |};
  declare module.exports: React$ComponentType<DialogContentTextProps>;
}

declare module 'material-ui/Dialog/DialogTitle' {
  declare type DialogTitleClasses = {|
    root?: Object,
  |};
  declare type DialogTitleProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: DialogTitleClasses,
    disableTypography?: boolean
  |};
  declare module.exports: React$ComponentType<DialogTitleProps>;
}

declare module 'material-ui/Dialog' {
  declare module.exports: {
    DialogActions: $Exports<'material-ui/Dialog/DialogActions'>,
    DialogContent: $Exports<'material-ui/Dialog/DialogContent'>,
    DialogContentText: $Exports<'material-ui/Dialog/DialogContentText'>,
    DialogTitle: $Exports<'material-ui/Dialog/DialogTitle'>,
    default: $Exports<'material-ui/Dialog/Dialog'>,
    withMobileDialog: $Exports<'material-ui/Dialog/withMobileDialog'>
  };
}

declare module 'material-ui/Dialog/withMobileDialog' {
  declare module.exports: any;
}

declare module 'material-ui/Divider/Divider' {
  declare type DividerClasses = {|
    root?: Object,
    inset?: Object,
    default?: Object,
    light?: Object,
    absolute?: Object,
  |};
  declare type DividerProps = {|
    ...MUI$BaseProps,
    absolute?: boolean,
    className?: string,
    classes?: DividerClasses,
    component?: React$ElementType,
    inset?: boolean,
    light?: boolean
  |};
  declare module.exports: React$ComponentType<DividerProps>;
}

declare module 'material-ui/Divider' {
  declare module.exports: $Exports<'material-ui/Divider/Divider'>;
}

declare module 'material-ui/Drawer/Drawer' {
  import type { ModalProps } from 'material-ui/Modal/Modal';
  import type { PaperProps } from 'material-ui/Paper/Paper';
  import type { SlideProps } from 'material-ui/transitions/Slide';
  import type { TransitionDuration } from 'material-ui/internal/transition';

  declare type Anchor = 'left' | 'top' | 'right' | 'bottom';
  declare type Variant = 'permanent' | 'persistent' | 'temporary';

  declare type DrawerClasses = {|
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
  declare type DrawerProps = {|
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
  declare module.exports: React$ComponentType<DrawerProps>;
}

declare module 'material-ui/Drawer' {
  declare module.exports: $Exports<'material-ui/Drawer/Drawer'>;
}

declare module 'material-ui/ExpansionPanel/ExpansionPanel' {
  import type { PaperProps } from 'material-ui/Paper/Paper';
  declare type ExpansionPanelClasses = {|
    root?: Object,
    expanded?: Object,
    disabled?: Object,
  |};
  declare type ExpansionPanelProps = {|
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
  declare module.exports: React$ComponentType<ExpansionPanelProps>;
}

declare module 'material-ui/ExpansionPanel/ExpansionPanelActions' {
  declare type ExpansionPanelActionsClasses = {|
    root?: Object,
    action?: Object,
  |};
  declare type ExpansionPanelActionsProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: ExpansionPanelActionsClasses,
  |};
  declare module.exports: React$ComponentType<ExpansionPanelActionsProps>;
}

declare module 'material-ui/ExpansionPanel/ExpansionPanelDetails' {
  declare type ExpansionPanelDetailsClasses = {|
    root?: Object,
  |};
  declare type ExpansionPanelDetailsProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    className?: string,
    classes?: ExpansionPanelDetailsClasses,
  |};
  declare module.exports: React$ComponentType<ExpansionPanelDetailsProps>;
}

declare module 'material-ui/ExpansionPanel/ExpansionPanelSummary' {
  import type { ButtonBaseProps } from 'material-ui/ButtonBase/ButtonBase'
  declare type ExpansionPanelSummaryClasses = {|
    root?: Object,
    expanded?: Object,
    focused?: Object,
    disabled?: Object,
    content?: Object,
    contentExpanded?: Object,
    expandIcon?: Object,
    expandIconExpanded?: Object,
  |};
  declare type ExpansionPanelSummaryProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    children?: React$Node,
    className?: string,
    classes?: ExpansionPanelSummaryClasses,
    expandIcon?: React$Node,
  |};
  declare module.exports: React$ComponentType<ExpansionPanelSummaryProps>;
}

declare module 'material-ui/ExpansionPanel' {
  declare module.exports: {
    default: $Exports<'material-ui/ExpansionPanel/ExpansionPanel'>,
    ExpansionPanelActions: $Exports<
      'material-ui/ExpansionPanel/ExpansionPanelActions'
    >,
    ExpansionPanelDetails: $Exports<
      'material-ui/ExpansionPanel/ExpansionPanelDetails'
    >,
    ExpansionPanelSummary: $Exports<
      'material-ui/ExpansionPanel/ExpansionPanelSummary'
    >
  };
}

declare module 'material-ui/Form/FormControl' {
  declare type Margin = 'none' | 'dense' | 'normal';

  declare type FormControlClasses = {|
    root?: Object,
    marginNormal?: Object,
    marginDense?: Object,
    fullWidth?: Object,
  |};
  declare type FormControlProps = {|
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
  declare module.exports: React$ComponentType<FormControlProps>;
}

declare module 'material-ui/Form/FormControlLabel' {
  declare type FormControlLabelClasses = {|
    root?: Object,
    disabled?: Object,
    label?: Object,
  |};
  declare type FormControlLabelProps = {|
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
  declare module.exports: React$ComponentType<FormControlLabelProps>;
}

declare module 'material-ui/Form/FormGroup' {
  declare type FormGroupClasses = {|
    root?: Object,
    row?: Object,
  |};
  declare type FormGroupProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: FormGroupClasses,
    className?: string,
    row?: boolean
  |};
  declare module.exports: React$ComponentType<FormGroupProps>;
}

declare module 'material-ui/Form/FormHelperText' {
  declare type FormHelperTextClasses = {|
    root?: Object,
    dense?: Object,
    error?: Object,
    disabled?: Object,
  |};
  declare type FormHelperTextProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: FormHelperTextClasses,
    className?: string,
    component?: React$ElementType,
    disabled?: boolean,
    error?: boolean,
    margin?: 'dense',
  |};
  declare module.exports: React$ComponentType<FormHelperTextProps>;
}

declare module 'material-ui/Form/FormLabel' {
  declare type FormLabelClasses = {|
    root?: Object,
    focused?: Object,
    error?: Object,
    disabled?: Object,
  |};
  declare type FormLabelProps = {|
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
  declare module.exports: React$ComponentType<FormLabelProps>;
}

declare module 'material-ui/Form' {
  declare module.exports: {
    FormGroup: $Exports<'material-ui/Form/FormGroup'>,
    FormLabel: $Exports<'material-ui/Form/FormLabel'>,
    FormControl: $Exports<'material-ui/Form/FormControl'>,
    FormHelperText: $Exports<'material-ui/Form/FormHelperText'>,
    FormControlLabel: $Exports<'material-ui/Form/FormControlLabel'>
  };
}

declare module 'material-ui/Grid/Grid' {
  declare type GridSizes =
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
  declare type AlignContent =
    | 'stretch'
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'space-between'
    | 'space-around';
  declare type AlignItems =
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'baseline';
  declare type Direction = 'row' | 'row-reverse' | 'column' | 'column-reverse';
  declare type Justify =
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around';
  declare type Spacing = 0 | 8 | 16 | 24 | 40;
  declare type Wrap = 'nowrap' | 'wrap' | 'wrap-reverse';

  declare type GridClasses = {|
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
  declare type GridProps = {|
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
  declare module.exports: React$ComponentType<GridProps>;
}

declare module 'material-ui/Grid' {
  declare module.exports: $Exports<'material-ui/Grid/Grid'>;
}

declare module 'material-ui/GridList/GridList' {
  declare type CellHeight = number | 'auto';

  declare type GridListClasses = {|
    root?: Object,
  |};
  declare type GridListProps = {|
    ...MUI$BaseProps,
    cellHeight?: CellHeight,
    children: React$Node,
    classes?: GridListClasses,
    className?: string,
    cols?: number,
    component?: React$ElementType,
    spacing?: number,
  |};
  declare module.exports: React$ComponentType<GridListProps>;
}

declare module 'material-ui/GridList/GridListTile' {
  declare type GridListTileClasses = {|
    root?: Object,
    tile?: Object,
    imgFullHeight?: Object,
    imgFullWidth?: Object,
  |};
  declare type GridListTileProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: GridListTileClasses,
    className?: string,
    cols?: number,
    component?: React$ElementType,
    rows?: number
  |};
  declare module.exports: React$ComponentType<GridListTileProps>;
}

declare module 'material-ui/GridList/GridListTileBar' {
  declare type TitlePosition = 'top' | 'bottom';
  declare type ActionPosition = 'left' | 'right';

  declare type GridListTileBarClasses = {|
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
  declare type GridListTileBarProps = {|
    ...MUI$BaseProps,
    actionIcon?: React$Node,
    actionPosition?: ActionPosition,
    classes?: GridListTileBarClasses,
    className?: string,
    subtitle?: React$Node,
    title: React$Node,
    titlePosition?: TitlePosition
  |};
  declare module.exports: React$ComponentType<GridListTileBarProps>;
}

declare module 'material-ui/GridList' {
  declare module.exports: {
    default: $Exports<'material-ui/GridList/GridList'>,
    GridList: $Exports<'material-ui/GridList/GridList'>,
    GridListTile: $Exports<'material-ui/GridList/GridListTile'>,
    GridListTileBar: $Exports<'material-ui/GridList/GridListTileBar'>
  };
}

declare module 'material-ui/Hidden/Hidden' {
  import type { Breakpoint } from 'material-ui/styles/createBreakpoints';

  declare type HiddenProps = {|
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
  declare module.exports: React$ComponentType<HiddenProps>;
}

declare module 'material-ui/Hidden/HiddenCss' {
  import typeof Hidden from 'material-ui/Hidden/Hidden';

  declare module.exports: React$ComponentType<React$ElementProps<Hidden>>;
}

declare module 'material-ui/Hidden/HiddenJs' {
  import typeof Hidden from 'material-ui/Hidden/Hidden';

  declare module.exports: React$ComponentType<React$ElementProps<Hidden>>;
}

declare module 'material-ui/Hidden' {
  declare module.exports: {
    default: $Exports<'material-ui/Hidden/Hidden'>,
    HiddenJs: $Exports<'material-ui/Hidden/HiddenJs'>
  };
}

declare module 'material-ui/Hidden/types' {
  declare module.exports: any;
}

declare module 'material-ui/Icon/Icon' {
  declare type Color =
    | 'inherit'
    | 'secondary'
    | 'action'
    | 'disabled'
    | 'error'
    | 'primary';

  declare type IconClasses = {|
    root?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    colorAction?: Object,
    colorDisabled?: Object,
    colorError?: Object,
    fontSize?: Object,
  |};
  declare type IconProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: IconClasses,
    color?: Color,
    fontSize?: boolean,
  |};
  declare module.exports: React$ComponentType<IconProps>;
}

declare module 'material-ui/Icon' {
  declare module.exports: $Exports<'material-ui/Icon/Icon'>;
}

declare module 'material-ui/IconButton/IconButton' {
  import type { ButtonBaseProps } from 'material-ui/ButtonBase/ButtonBase';
  declare type Color =
    | 'default'
    | 'inherit'
    | 'primary'
    | 'secondary';

  declare type IconButtonClasses = {|
    root?: Object,
    colorInherit?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    disabled?: Object,
    label?: Object,
  |};
  declare type IconButtonProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    children?: React$Node,
    classes?: IconButtonClasses,
    className?: string,
    color?: Color,
    disabled?: boolean,
    disableRipple?: boolean,
  |};
  declare module.exports: React$ComponentType<IconButtonProps>;
}

declare module 'material-ui/IconButton' {
  declare module.exports: $Exports<'material-ui/IconButton/IconButton'>;
}

declare module 'material-ui/Input' {
  declare module.exports: {
    default: $Exports<'material-ui/Input/Input'>,
    InputAdornment: $Exports<'material-ui/Input/InputAdornment'>,
    InputLabel: $Exports<'material-ui/Input/InputLabel'>
  };
}

declare module 'material-ui/Input/Input' {
  declare type InputClasses = {|
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
  declare type InputProps = {|
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
  declare module.exports: React$ComponentType<InputProps>;
}

declare module 'material-ui/Input/InputAdornment' {
  declare type InputAdornmentClasses = {|
    root?: Object,
    positionStart?: Object,
    positionEnd?: Object,
  |};
  declare type InputAdornmentProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    classes?: InputAdornmentClasses,
    className?: string,
    component?: React$ElementType,
    disableTypography?: boolean,
    position?: 'start' | 'end',
  |};
  declare module.exports: React$ComponentType<InputAdornmentProps>;
}

declare module 'material-ui/Input/InputLabel' {
  import type { FormLabelProps, FormLabelClasses } from 'material-ui/Form/FormLabel';
  declare type InputLabelClasses = {|
    root?: Object,
    formControl?: Object,
    labelDense?: Object,
    shrink?: Object,
    animated?: Object,
    disabled?: Object,
  |};
  declare type InputLabelProps = {|
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
  declare module.exports: React$ComponentType<InputLabelProps>;
}

declare module 'material-ui/Input/Textarea' {
  declare type Rows = string | number;

  declare module.exports: React$ComponentType<{|
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
}

declare module 'material-ui/internal/dom' {
  declare module.exports: any;
}

declare module 'material-ui/Portal/Portal' {
  declare type PortalProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    container?: React$ElementType,
    onRendered?: () => void,
  |};
  declare module.exports: React$ComponentType<PortalProps>;
}

declare module 'material-ui/internal/transition' {
  declare type TransitionDuration = number | { enter: number, exit: number };
  declare type TransitionCallback = (element: HTMLElement) => void;
  declare type TransitionClasses = {|
    appear?: string,
    appearActive?: string,
    enter?: string,
    enterActive?: string,
    exit?: string,
    exitActive?: string
  |};
  declare type TransitionProps = {|
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

declare module 'material-ui/List' {
  declare module.exports: {
    ListItem: $Exports<'material-ui/List/ListItem'>,
    ListItemAvatar: $Exports<'material-ui/List/ListItemAvatar'>,
    ListItemText: $Exports<'material-ui/List/ListItemText'>,
    ListItemIcon: $Exports<'material-ui/List/ListItemIcon'>,
    ListItemSecondaryAction: $Exports<
      'material-ui/List/ListItemSecondaryAction'
    >,
    ListSubheader: $Exports<'material-ui/List/ListSubheader'>
  };
}

declare module 'material-ui/List/List' {
  declare type ListClasses = {|
    root?: Object,
    padding?: Object,
    dense?: Object,
    subheader?: Object,
  |};
  declare type ListProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: ListClasses,
    className?: string,
    component?: React$ElementType,
    dense?: boolean,
    disablePadding?: boolean,
    subheader?: React$Node
  |};
  declare module.exports: React$ComponentType<ListProps>;
}

declare module 'material-ui/List/ListItem' {
  declare type ListItemClasses = {|
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
  declare type ListItemProps = {|
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
  declare module.exports: React$ComponentType<ListItemProps>;
}

declare module 'material-ui/List/ListItemAvatar' {
  declare type ListItemAvatarClasses = {|
    root?: Object,
    icon?: Object,
  |};
  declare type ListItemAvatarProps = {|
    ...MUI$BaseProps,
    children: React$Element<any>,
    classes?: ListItemAvatarClasses,
    className?: string
  |};
  declare module.exports: React$ComponentType<ListItemAvatarProps>;
}

declare module 'material-ui/List/ListItemIcon' {
  declare type ListItemIconClasses = {|
    root?: Object,
  |};
  declare type ListItemIconProps = {|
    ...MUI$BaseProps,
    children: React$Element<any>,
    classes?: ListItemIconClasses,
    className?: string
  |};
  declare module.exports: React$ComponentType<ListItemIconProps>;
}

declare module 'material-ui/List/ListItemSecondaryAction' {
  declare type ListItemSecondaryActionClasses = {|
    root?: Object,
  |};
  declare type ListItemSecondaryActionProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: ListItemSecondaryActionClasses,
    className?: string
  |};
  declare module.exports: React$ComponentType<ListItemSecondaryActionProps>;
}

declare module 'material-ui/List/ListItemText' {
  declare type ListItemTextClasses = {|
    root?: Object,
    inset?: Object,
    dense?: Object,
    primary?: Object,
    secondary?: Object,
    textDense?: Object,
  |};
  declare type ListItemTextProps = {|
    ...MUI$BaseProps,
    classes?: ListItemTextClasses,
    className?: string,
    disableTypography?: boolean,
    inset?: boolean,
    primary?: React$Node,
    secondary?: React$Node
  |};
  declare module.exports: React$ComponentType<ListItemTextProps>;
}

declare module 'material-ui/List/ListSubheader' {
  declare type Color = 'default' | 'primary' | 'inherit';

  declare type ListSubheaderClasses = {|
    root?: Object,
    colorPrimary?: Object,
    colorInherit?: Object,
    inset?: Object,
    sticky?: Object,
  |};
  declare type ListSubheaderProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: ListSubheaderClasses,
    className?: string,
    color?: Color,
    component?: React$ElementType,
    disableSticky?: boolean,
    inset?: boolean
  |};
  declare module.exports: React$ComponentType<ListSubheaderProps>;
}

declare module 'material-ui/Menu' {
  declare module.exports: {
    default: $Exports<'material-ui/Menu/Menu'>,
    MenuList: $Exports<'material-ui/Menu/MenuList'>,
    MenuItem: $Exports<'material-ui/Menu/MenuItem'>
  };
}

declare module 'material-ui/Menu/Menu' {
  import type { MenuListProps } from 'material-ui/Menu/MenuList';
  import type { PaperProps } from 'material-ui/Paper/Paper';
  import type { PopoverClasses } from 'material-ui/Popover/Popover';
  import type { TransitionCallback } from 'material-ui/internal/transition';

  declare type TransitionDuration =
    | number
    | { enter?: number, exit?: number }
    | 'auto';

  declare type MenuClasses = {|
    paper: Object,
  |};
  declare type MenuProps = {|
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
    transitionDuration?: TransitionDuration,

    id?: string,
  |};
  declare module.exports: React$ComponentType<MenuProps>;
}

declare module 'material-ui/Menu/MenuItem' {
  declare type MenuItemClasses = {|
    root?: Object,
    selected?: Object,
  |};
  declare type MenuItemProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: MenuItemClasses,
    className?: string,
    component?: React$ElementType,
    selected?: boolean,

    // Typically want to add a value for the onChange event of the Menu/Select
    value?: any,
  |};
  declare module.exports: React$ComponentType<MenuItemProps>;
}

declare module 'material-ui/Menu/MenuList' {
  declare type MenuListProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
  |};
  declare module.exports: React$ComponentType<MenuListProps>;
}

declare module 'material-ui/MobileStepper' {
  declare module.exports: $Exports<'material-ui/MobileStepper/MobileStepper'>;
}

declare module 'material-ui/MobileStepper/MobileStepper' {
  declare type Position = 'bottom' | 'top' | 'static';
  declare type Variant = 'text' | 'dots' | 'progress';

  declare type MobileStepperClasses = {|
    root?: Object,
    positionBottom?: Object,
    positionTop?: Object,
    positionStatic?: Object,
    dots?: Object,
    dot?: Object,
    dotActive?: Object,
    progress?: Object,
  |};
  declare type MobileStepperProps = {|
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
  declare module.exports: React$ComponentType<MobileStepperProps>;
}

declare module 'material-ui/Modal/Backdrop' {
  declare module.exports: React$ComponentType<{|
    children?: React$Node,
    classes?: Object,
    className?: string,
    invisible?: boolean
  |}>;
}

declare module 'material-ui/Modal' {
  declare module.exports: $Exports<'material-ui/Modal/Modal'>;
}

declare module 'material-ui/Modal/Modal' {
  import type { PortalProps } from 'material-ui/Portal/Portal';

  declare type ModalClasses = {|
    root?: Object,
    hidden?: Object,
  |};
  declare type ModalProps = {|
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
  declare module.exports: React$ComponentType<ModalProps>;
}

declare module 'material-ui/Modal/modalManager' {
  declare module.exports: any;
}

declare module 'material-ui/Paper' {
  declare module.exports: $Exports<'material-ui/Paper/Paper'>;
}

declare module 'material-ui/Paper/Paper' {
  declare type PaperClasses = {|
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
  declare type PaperProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: PaperClasses,
    className?: string,
    component?: React$ElementType,
    elevation?: number,
    square?: boolean
  |};
  declare module.exports: React$ComponentType<PaperProps>;
}

declare module 'material-ui/Popover' {
  declare module.exports: $Exports<'material-ui/Popover/Popover'>;
}

declare module 'material-ui/Popover/Popover' {
  import type { ModalProps } from 'material-ui/Modal/Modal';
  import type { PaperProps } from 'material-ui/Paper/Paper';
  import type {
    TransitionCallback,
  } from 'material-ui/internal/transition';

  declare type Position = {
    top: number,
    left: number
  };

  declare type Origin = {
    horizontal: 'left' | 'center' | 'right' | number,
    vertical: 'top' | 'center' | 'bottom' | number
  };

  declare type PopoverClasses = {|
    paper?: Object,
  |};
  declare type PopoverProps = {|
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
    transition?: React$ElementType,
    transitionDuration?: number | { enter?: number, exit?: number } | 'auto'
  |};
  declare module.exports: React$ComponentType<PopoverProps>;
}

declare module 'material-ui/Progress/CircularProgress' {
  declare type Color = 'primary' | 'secondary' | 'inherit';
  declare type Mode = 'determinate' | 'indeterminate' | 'static';

  declare type CircularProgressClases = {|
    root?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    svg?: Object,
    svgIndeterminate?: Object,
    circle?: Object,
    circleIndeterminate?: Object,
  |};
  declare type CircularProgressProps = {|
    ...MUI$BaseProps,
    classes?: CircularProgressClases,
    className?: string,
    color?: Color,
    max?: number,
    min?: number,
    size?: number,
    thickness?: number,
    value?: number,
    variant?: Mode,
  |};
  declare module.exports: React$ComponentType<CircularProgressProps>;
}

declare module 'material-ui/Progress' {
  declare module.exports: {
    CircularProgress: $Exports<'material-ui/Progress/CircularProgress'>,
    LinearProgress: $Exports<'material-ui/Progress/LinearProgress'>
  };
}

declare module 'material-ui/Progress/LinearProgress' {
  declare type Color = 'primary' | 'secondary';
  declare type Variant = 'determinate' | 'indeterminate' | 'buffer' | 'query';

  declare type LinearProgressClasses = {|
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
  declare type LinearProgressProps = {|
    ...MUI$BaseProps,
    classes?: LinearProgressClasses,
    className?: string,
    color?: Color,
    value?: number,
    valueBuffer?: number,
    variant?: Variant,
  |};
  declare module.exports: React$ComponentType<LinearProgressProps>;
}

declare module 'material-ui/Radio' {
  declare module.exports: {
    default: $Exports<'material-ui/Radio/Radio'>,
    RadioGroup: $Exports<'material-ui/Radio/RadioGroup'>
  };
}

declare module 'material-ui/Radio/Radio' {
  declare type RadioClases = {|
    default?: Object,
    checked?: Object,
    checkedPrimary?: Object,
    checkedSecondary?: Object,
    disabled?: Object,
  |};
  declare type RadioProps = {|
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
  declare module.exports: React$ComponentType<RadioProps>;
}

declare module 'material-ui/Radio/RadioGroup' {
  import type { FormGroupProps } from 'material-ui/Form/FormGroup';
  declare type RadioGroupProps = {|
    ...MUI$BaseProps,
    ...FormGroupProps,
    children?: React$Node,
    name?: string,
    onChange?: (event: SyntheticEvent<>, value: string) => void,
    value?: string
  |};
  declare module.exports: React$ComponentType<RadioGroupProps>;
}

declare module 'material-ui/Select' {
  declare module.exports: $Exports<'material-ui/Select/Select'>;
}

declare module 'material-ui/Select/Select' {
  import type { ChildrenArray } from 'react';
  import type { InputProps } from 'material-ui/Input/Input';
  import type { MenuProps } from 'material-ui/Menu/Menu';

  declare type SelectClasses = {|
    root?: Object,
    select?: Object,
    selectMenu?: Object,
    disabled?: Object,
    icon?: Object,
  |};
  declare type SelectProps = {|
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
  declare module.exports: React$ComponentType<SelectProps>;
}

declare module 'material-ui/Select/SelectInput' {
  declare module.exports: React$ComponentType<{|
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
}

declare module 'material-ui/Snackbar' {
  declare module.exports: {
    default: $Exports<'material-ui/Snackbar/Snackbar'>,
    SnackbarContent: $Exports<'material-ui/Snackbar/SnackbarContent'>
  };
}

declare module 'material-ui/Snackbar/Snackbar' {
  import type {
    TransitionDuration,
    TransitionCallback
  } from 'material-ui/internal/transition';
  import type { SnackbarContentProps } from 'material-ui/Snackbar/SnackbarContent';

  declare type Origin = {
    horizontal?: 'left' | 'center' | 'right' | number,
    vertical?: 'top' | 'center' | 'bottom' | number
  };

  declare type SnackbarClasses = {|
    root?: Object,
    anchorTopCenter?: Object,
    anchorBottomCenter?: Object,
    anchorTopRight?: Object,
    anchorBottomRight?: Object,
    anchorTopLeft?: Object,
    anchorBottomLeft?: Object,
  |};
  declare type SnackbarProps = {|
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
    SnackbarContentProps?: SnackbarContentProps,
    transition?: React$ElementType,
    transitionDuration?: TransitionDuration,
  |};
  declare module.exports: React$ComponentType<SnackbarProps>;
}

declare module 'material-ui/Snackbar/SnackbarContent' {
  import type { PaperProps } from 'material-ui/Paper/Paper';
  declare type SnackbarContentClasses = {|
    root?: Object,
    message?: Object,
    action?: Object,
  |};
  declare type SnackbarContentProps = {|
    ...MUI$BaseProps,
    ...PaperProps,
    action?: React$Node,
    classes?: SnackbarContentClasses,
    className?: string,
    message?: React$Node
  |};
  declare module.exports: React$ComponentType<SnackbarContentProps>;
}

declare module 'material-ui/Stepper' {
  declare module.exports: {
    default: $Exports<'material-ui/Stepper/Stepper'>,
    Step: $Exports<'material-ui/Stepper/Step'>,
    StepButton: $Exports<'material-ui/Stepper/StepButton'>,
    StepContent: $Exports<'material-ui/Stepper/StepContent'>,
    StepLabel: $Exports<'material-ui/Stepper/StepLabel'>
  };
}

declare module 'material-ui/Stepper/Step' {
  declare type StepClasses = {|
    root?: Object,
    horizontal?: Object,
    vertical?: Object,
    alternativeLabel?: Object,
  |};
  declare type StepProps = {|
    ...MUI$BaseProps,
    active?: boolean,
    children?: React$Node,
    classes?: StepClasses,
    className?: string,
    completed?: boolean,
    disabled?: boolean,
  |};
  declare module.exports: React$ComponentType<StepProps>;
}

declare module 'material-ui/Stepper/StepButton' {
  import type { ButtonBaseProps } from 'material-ui/ButtonBase/ButtonBase';

  declare type StepButtonClasses = {|
    root?: Object,
  |};
  declare type StepButtonProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    children?: React$Node,
    classes?: StepButtonClasses,
    className?: string,
    icon?: React$Node,
    optional?: boolean,
  |}
  declare module.exports: React$ComponentType<StepButtonProps>;
}

declare module 'material-ui/Stepper/StepContent' {
  import type { TransitionDuration } from 'material-ui/transitions/Collapse';
  import type { Orientation } from 'material-ui/Stepper/Stepper';

  declare type StepContentClasses = {|
    root?: Object,
    last?: Object,
    transition?: Object,
  |};
  declare type StepContentProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    className?: string,
    classes?: StepContentClasses,
    transition?: React$ElementType,
    transitionDuration?: TransitionDuration
  |};
  declare module.exports: React$ComponentType<StepContentProps>;
}

declare module 'material-ui/Stepper/StepIcon' {
  declare type StepIconClasses = {|
    root?: Object,
    completed?: Object,
  |};
  declare type StepIconProps = {|
    ...MUI$BaseProps,
    active?: boolean,
    className?: string,
    classes?: StepIconClasses,
    completed?: boolean,
    icon: React$Node,
  |};
  declare module.exports: React$ComponentType<StepIconProps>;
}

declare module 'material-ui/Stepper/StepLabel' {
  import type { Orientation } from 'material-ui/Stepper/Stepper';

  declare type StepLabelClasses = {|
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
  declare type StepLabelProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: StepLabelClasses,
    className?: string,
    disabled?: boolean,
    icon?: React$Node,
    optional?: boolean,
  |};
  declare module.exports: React$ComponentType<StepLabelProps>;
}

declare module 'material-ui/Stepper/Stepper' {
  import type { ChildrenArray } from 'react';
  import typeof Step from 'material-ui/Stepper/Step';

  declare type Orientation = 'horizontal' | 'vertical';

  declare type StepperClasses = {|
    root?: Object,
    horizontal?: Object,
    vertical?: Object,
    alternativeLabel?: Object,
  |};
  declare type StepperProps = {|
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
  declare module.exports: React$ComponentType<StepperProps>;
}

declare module 'material-ui/styles/colorManipulator' {
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

declare module 'material-ui/styles/createBreakpoints' {
  declare type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  declare type BreakpointValues = { [key: Breakpoint]: number };

  declare type Breakpoints = {|
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

declare module 'material-ui/styles/createGenerateClassName' {
  declare module.exports: () => any;
}

declare module 'material-ui/styles/createMixins' {
  declare type Mixins = {|
    gutters: (styles: Object) => Object;
    toolbar: Object;
  |};

  declare module.exports: (
    breakpoints: Object,
    spacing: Object,
    mixins: Object
  ) => any;
}

declare module 'material-ui/styles/createMuiTheme' {
  import type { Breakpoints } from 'material-ui/styles/createBreakpoints';
  import type { Mixins } from 'material-ui/styles/createMixins';
  import type { Palette } from 'material-ui/styles/createPalette';
  import type { Shadows } from 'material-ui/styles/shadows';
  import type { Spacing } from 'material-ui/styles/spacing';
  import type { Transitions } from 'material-ui/styles/transitions';
  import type { Typography } from 'material-ui/styles/createTypography';
  import type { ZIndex } from 'material-ui/styles/zIndex';

  declare type Direction = 'ltr' | 'rtl';
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

declare module 'material-ui/styles/createPalette' {

  declare type CommonColors = {|
    black: string;
    white: string;
  |};

  declare type PaletteType = 'light' | 'dark';

  declare type Color = {|
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
  declare type TypeText = {|
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  |};

  declare type TypeAction = {|
    active: string;
    hover: string;
    selected: string;
    disabled: string;
    disabledBackground: string;
  |};

  declare type TypeBackground = {|
    default: string;
    paper: string;
  |}

  declare type PaletteColor = {|
    light: string;
    main: string;
    dark: string;
    contrastText: string;
  |}

  declare type TypeObject = {|
    text: TypeText;
    action: TypeAction;
    background: TypeBackground;
  |}

  declare type Palette = {|
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

declare module 'material-ui/styles/createTypography' {
  declare type TextStyle =
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

  declare type Style = TextStyle | 'button';

  declare type FontStyle = {|
    fontFamily: string,
    fontSize: string,
    fontWeightLight: number,
    fontWeightRegular: number,
    fontWeightMedium: number,
    htmlFontSize?: number;
  |}

  declare type TypographyStyle = {|
    color?: string,
    fontFamily: string,
    fontSize: string,
    fontWeight: string,
    letterSpacing?: string,
    lineHeight?: string,
    textTransform?: string,
  |};

  declare type TypographyUtils = {
    pxToRem: (px: number) => string;
  }

  declare type Typography = {
    ...FontStyle,
    ...TypographyUtils,
    [key: Style]: TypographyStyle,
  };

  declare module.exports: (
    palette: Object,
    typography: Object | Function
  ) => any;
}

declare module 'material-ui/styles/getStylesCreator' {
  declare module.exports: (stylesOrCreator: Object | (Object => Object)) => any;
}

declare module 'material-ui/styles' {
  declare module.exports: {
    MuiThemeProvider: $Exports<'material-ui/styles/MuiThemeProvider'>,
    withStyles: $Exports<'material-ui/styles/withStyles'>,
    withTheme: $Exports<'material-ui/styles/withTheme'>,
    createMuiTheme: $Exports<'material-ui/styles/createMuiTheme'>
  };
}

declare module 'material-ui/styles/MuiThemeProvider' {
  declare type MuiThemeProviderProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    disableStylesGeneration?: boolean,
    sheetsManager?: Object,
    theme: Object | Function,
  |};
  declare module.exports: React$ComponentType<MuiThemeProviderProps>;
}

declare module 'material-ui/styles/shadows' {
  declare type Shadows = [
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

declare module 'material-ui/styles/spacing' {
  declare type Spacing = {|
    unit: number;
  |};

  declare module.exports: Object;
}

declare module 'material-ui/styles/themeListener' {
  declare module.exports: {
    CHANNEL: string,
    default: Object
  };
}

declare module 'material-ui/styles/transitions' {
  declare type Easing = {|
    easeInOut: string;
    easeOut: string;
    easeIn: string;
    sharp: string;
  |};

  declare type Duration = {|
    shortest: number;
    shorter: number;
    short: number;
    standard: number;
    complex: number;
    enteringScreen: number;
    leavingScreen: number;
  |};

  declare type Transitions = {|
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

declare module 'material-ui/styles/withStyles' {
  declare type Options = {
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

declare module 'material-ui/styles/withTheme' {
  declare module.exports: () => <Props: {}>(
    Component: React$ComponentType<Props>
  ) => React$ComponentType<Props>;
}

declare module 'material-ui/styles/zIndex' {
  declare type ZIndex = {|
    mobileStepper: number;
    appBar: number;
    drawer: number;
    modal: number;
    snackbar: number;
    tooltip: number;
  |};

  declare module.exports: Object;
}

declare module 'material-ui/svg-icons/ArrowDownward' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/svg-icons/ArrowDropDown' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/svg-icons/Cancel' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/svg-icons/CheckBox' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/svg-icons/CheckBoxOutlineBlank' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/svg-icons/CheckCircle' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/svg-icons/IndeterminateCheckBox' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/svg-icons/KeyboardArrowLeft' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/svg-icons/KeyboardArrowRight' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/svg-icons/RadioButtonChecked' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/svg-icons/RadioButtonUnchecked' {
  declare module.exports: React$ComponentType<Object>;
}

declare module 'material-ui/SvgIcon' {
  declare module.exports: $Exports<'material-ui/SvgIcon/SvgIcon'>;
}

declare module 'material-ui/SvgIcon/SvgIcon' {
  declare type Color = 'action' | 'disabled' | 'error' | 'inherit' | 'primary' | 'secondary';
  declare type SvgIconClasses = {|
    root?: Object,
    colorPrimary?: Object,
    colorSecondary?: Object,
    colorAction?: Object,
    colorDisabled?: Object,
    colorError?: Object,
    fontSize?: Object,
  |};
  declare type SvgIconProps = {|
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
  declare module.exports: React$ComponentType<SvgIconProps>;
}

declare module 'material-ui/Switch' {
  declare module.exports: $Exports<'material-ui/Switch/Switch'>;
}

declare module 'material-ui/Switch/Switch' {
  declare type SwitchClasses = {|
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
  declare type SwitchProps = {|
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
  declare module.exports: React$ComponentType<SwitchProps>;
}

declare module 'material-ui/Table' {
  declare module.exports: {
    default: $Exports<'material-ui/Table/Table'>,
    TableBody: $Exports<'material-ui/Table/TableBody'>,
    TableCell: $Exports<'material-ui/Table/TableCell'>,
    TableFooter: $Exports<'material-ui/Table/TableFooter'>,
    TableHead: $Exports<'material-ui/Table/TableHead'>,
    TablePagination: $Exports<'material-ui/Table/TablePagination'>,
    TableRow: $Exports<'material-ui/Table/TableRow'>,
    TableSortLabel: $Exports<'material-ui/Table/TableSortLabel'>
  };
}

declare module 'material-ui/Table/Table' {
  declare type TableClasses = {|
    root?: Object,
  |};
  declare type TableProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    classes?: TableClasses,
    className?: string,
    component?: React$ElementType
  |};
  declare module.exports: React$ComponentType<TableProps>;
}

declare module 'material-ui/Table/TableBody' {
  declare type TableBodyProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    component?: React$ElementType
  |};
  declare module.exports: React$ComponentType<TableBodyProps>;
}

declare module 'material-ui/Table/TableCell' {
  declare type Padding = 'default' | 'checkbox' | 'dense' | 'none';
  declare type Direction = 'asc' | 'desc' | false;
  declare type Variant = 'head' | 'body' | 'footer';

  declare type TableCellClasses = {|
    root?: Object,
    numeric?: Object,
    typeHead?: Object,
    typeBody?: Object,
    typeFooter?: Object,
    paddingDefault?: Object,
    paddingDense?: Object,
    paddingCheckbox?: Object,
  |};
  declare type TableCellProps = {|
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
  declare module.exports: React$ComponentType<TableCellProps>;
}

declare module 'material-ui/Table/TableFooter' {
  declare type TableFooterProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    component?: React$ElementType,
  |};
  declare module.exports: React$ComponentType<TableFooterProps>;
}

declare module 'material-ui/Table/TableHead' {
  declare type TableHeadProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    component?: React$ElementType
  |};
  declare module.exports: React$ComponentType<TableHeadProps>;
}

declare module 'material-ui/Table/TablePagination' {
  import type { IconButtonProps } from 'material-ui/IconButton/IconButton';
  declare type LabelDisplayedRowsArgs = {
    from: number,
    to: number,
    count: number,
  };
  declare type LabelDisplayedRows = (
    paginationInfo: LabelDisplayedRowsArgs
  ) => Node;

  declare type TablePaginationClasses = {|
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
  declare type TablePaginationProps = {|
    ...MUI$BaseProps,
    Actions?: React$ElementType,
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
  declare module.exports: React$ComponentType<TablePaginationProps>;
}

declare module 'material-ui/Table/TableRow' {
  declare type TableRowClasses = {|
    root?: Object,
    typeHead?: Object,
    typeFooter?: Object,
    selected?: Object,
    hover?: Object,
  |};
  declare type TableRowProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: TableRowClasses,
    className?: string,
    component?: React$ElementType,
    hover?: boolean,
    selected?: boolean
  |};
  declare module.exports: React$ComponentType<TableRowProps>;
}

declare module 'material-ui/Table/TableSortLabel' {
  import type { ButtonBaseProps } from 'material-ui/ButtonBase/ButtonBase';
  declare type Direction = 'asc' | 'desc';

  declare type TableSortLabelClasses = {|
    root?: Object,
    active?: Object,
    icon?: Object,
    desc?: Object,
    asc?: Object,
  |};
  declare type TableSortLabelProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    active?: boolean,
    children?: React$Node,
    classes?: TableSortLabelClasses,
    className?: string,
    direction?: Direction
  |};
  declare module.exports: React$ComponentType<TableSortLabelProps>;
}

declare module 'material-ui/Tabs' {
  declare module.exports: {
    default: $Exports<'material-ui/Tabs/Tabs'>,
    Tab: $Exports<'material-ui/Tabs/Tab'>
  };
}

declare module 'material-ui/Tabs/Tab' {
  import type { ButtonBaseProps } from 'material-ui/ButtonBase/ButtonBase';
  declare type TabClasses = {|
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
  declare type TabProps = {|
    ...MUI$BaseProps,
    ...ButtonBaseProps,
    classes?: TabClasses,
    className?: string,
    disabled?: boolean,
    icon?: React$Node,
    label?: React$Node,
    value?: any,
  |};
  declare module.exports: React$ComponentType<TabProps>;
}

declare module 'material-ui/Tabs/Tabs' {
  declare type IndicatorColor = 'secondary' | 'primary' | string;
  declare type ScrollButtons = 'auto' | 'on' | 'off';
  declare type TextColor = 'secondary' | 'primary' | 'inherit';

  declare type TabsClasses = {|
    root?: Object,
    flexContainer?: Object,
    scrollingContainer?: Object,
    fixed?: Object,
    scrollable?: Object,
    centered?: Object,
    buttonAuto?: Object,
  |};
  declare type TabsProps = {|
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
    TabScrollButton?: React$ComponentType<>,
    textColor?: TextColor,
    value: any,
  |};
  declare module.exports: React$ComponentType<TabsProps>;
}

declare module 'material-ui/TextField' {
  declare module.exports: $Exports<'material-ui/TextField/TextField'>;
}

declare module 'material-ui/TextField/TextField' {
  import type { FormControlProps } from 'material-ui/Form/FormControl';
  import type { FormHelperTextProps } from 'material-ui/Form/FormHelperText';
  import type { InputProps } from 'material-ui/Input/Input';
  import type { InputLabelProps } from 'material-ui/Input/InputLabel';
  import type { SelectProps } from 'material-ui/Select/Select';

  declare type TextFieldProps = {|
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
  declare module.exports: React$ComponentType<TextFieldProps>;
}

declare module 'material-ui/Toolbar' {
  declare module.exports: $Exports<'material-ui/Toolbar/Toolbar'>;
}

declare module 'material-ui/Toolbar/Toolbar' {
  declare type ToolbarClasses = {|
    root?: Object,
    gutters?: Object,
  |};
  declare type ToolbarProps = {|
    ...MUI$BaseProps,
    children?: React$Node,
    classes?: ToolbarClasses,
    className?: string,
    disableGutters?: boolean
  |};
  declare module.exports: React$ComponentType<ToolbarProps>;
}

declare module 'material-ui/Tooltip' {
  declare module.exports: $Exports<'material-ui/Tooltip/Tooltip'>;
}

declare module 'material-ui/Tooltip/Tooltip' {
  declare type Placement =
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

  declare type TooltipClasses = {|
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
  declare type TooltipProps = {|
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
  declare module.exports: React$ComponentType<TooltipProps>;
}

declare module 'material-ui/transitions/Collapse' {
  import type { TransitionProps } from 'material-ui/internal/transition';

  declare type TransitionDuration =
    | number
    | { enter?: number, exit?: number }
    | 'auto';

  declare type CollapseClasses = {|
    container?: Object,
    entered?: Object,
    wrapper?: Object,
    wrapperInner?: Object,
  |};
  declare type CollapseProps = {|
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
  declare module.exports: React$ComponentType<CollapseProps>;
}

declare module 'material-ui/transitions/Fade' {
  import type {
    TransitionProps,
  } from 'material-ui/internal/transition';

  declare type FadeProps = {|
    ...MUI$BaseProps,
    ...TransitionProps,
    children?: React$Element<any>,
    in?: boolean,
  |};
  declare module.exports: React$ComponentType<FadeProps>;
}

declare module 'material-ui/transitions/Grow' {
  import type {
    TransitionProps,
  } from 'material-ui/internal/transition';

  declare type TransitionDuration =
    | number
    | { enter?: number, exit?: number }
    | 'auto';

  declare type GrowProps = {|
    ...MUI$BaseProps,
    ...TransitionProps,
    children?: React$Element<any>,
    in?: boolean,
    timeout?: TransitionDuration
  |};
  declare module.exports: React$ComponentType<GrowProps>;
}

declare module 'material-ui/transitions' {
  declare module.exports: {
    Slide: $Exports<'material-ui/transitions/Slide'>,
    Grow: $Exports<'material-ui/transitions/Grow'>,
    Fade: $Exports<'material-ui/transitions/Fade'>,
    Collapse: $Exports<'material-ui/transitions/Collapse'>
  };
}

declare module 'material-ui/transitions/Slide' {
  import type { TransitionProps } from 'material-ui/internal/transition';

  declare type Direction = 'left' | 'right' | 'up' | 'down';

  declare function setTranslateValue(
    props: Object,
    node: HTMLElement | Object
  ): void;

  declare type SlideProps = {|
    ...MUI$BaseProps,
    ...TransitionProps,
    children?: React$Node,
    direction?: Direction,
    in?: boolean,
  |};
  declare module.exports: React$ComponentType<SlideProps>;
}

declare module 'material-ui/Typography' {
  declare module.exports: $Exports<'material-ui/Typography/Typography'>;
}

declare module 'material-ui/Typography/Typography' {
  declare type Align = 'inherit' | 'left' | 'center' | 'right' | 'justify';
  declare type Color =
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'secondary'
    | 'error'
    | 'default';
  declare type Variant =
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

  declare type TypographyClasses = {|
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
  declare type TypographyProps = {|
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
  declare module.exports: React$ComponentType<TypographyProps>;
}

declare module 'material-ui/utils/addEventListener' {
  declare module.exports: (
    node: React$Node,
    event: string,
    handler: EventHandler,
    capture?: boolean
  ) => any;
}

declare module 'material-ui/utils/ClickAwayListener' {
  declare type ClickAwayListenerProps = {|
    ...MUI$BaseProps,
    children: React$Node,
    onClickAway: (event: SyntheticEvent<>) => void
  |};
  declare module.exports: React$ComponentType<ClickAwayListenerProps>;
}

declare module 'material-ui/utils/exactProp' {
  declare module.exports: (
    propTypes: Object,
    componentNameInError: string
  ) => any;
}

declare module 'material-ui/utils/helpers' {
  declare module.exports: {
    capitalizeFirstLetter: Function,
    contains: (obj: Object, pred: Object) => any,
    findIndex: (arr: Array<any>, pred: any) => any,
    find: (arr: Array<any>, pred: any) => any,
    createChainedFunction: (...funcs: Array<any>) => any
  };
}

declare module 'material-ui/utils/keyboardFocus' {
  declare module.exports: {
    focusKeyPressed: Function,
    detectKeyboardFocus: Function,
    listenForFocusKeys: Function
  };
}

declare module 'material-ui/utils/manageAriaHidden' {
  declare module.exports: {
    ariaHidden: Function,
    hideSiblings: Function,
    showSiblings: Function
  };
}

declare module 'material-ui/utils/reactHelpers' {
  declare module.exports: {
    cloneChildrenWithClassName: (
      children?: React$Node,
      className: string
    ) => any,
    isMuiElement: (element: any, muiNames: Array<string>) => any,
    isMuiComponent: (element: any, muiNames: Array<string>) => any
  };
}

declare module 'material-ui/utils/requirePropFactory' {
  declare module.exports: (componentNameInError: string) => any;
}

declare module 'material-ui/utils/withWidth' {
  declare module.exports: (
    options: Object
  ) => <Props: {}>(
    Component: React$ComponentType<Props>
  ) => React$ComponentType<Props>;
}

// Filename aliases
declare module 'material-ui/AppBar/AppBar.js' {
  declare module.exports: $Exports<'material-ui/AppBar/AppBar'>;
}
declare module 'material-ui/AppBar/index.js' {
  declare module.exports: $Exports<'material-ui/AppBar'>;
}
declare module 'material-ui/Avatar/Avatar.js' {
  declare module.exports: $Exports<'material-ui/Avatar/Avatar'>;
}
declare module 'material-ui/Avatar/index.js' {
  declare module.exports: $Exports<'material-ui/Avatar'>;
}
declare module 'material-ui/Badge/Badge.js' {
  declare module.exports: $Exports<'material-ui/Badge/Badge'>;
}
declare module 'material-ui/Badge/index.js' {
  declare module.exports: $Exports<'material-ui/Badge'>;
}
declare module 'material-ui/BottomNavigation/BottomNavigation.js' {
  declare module.exports: $Exports<
    'material-ui/BottomNavigation/BottomNavigation'
  >;
}
declare module 'material-ui/BottomNavigation/BottomNavigationAction.js' {
  declare module.exports: $Exports<
    'material-ui/BottomNavigation/BottomNavigationAction'
  >;
}
declare module 'material-ui/BottomNavigation/index.js' {
  declare module.exports: $Exports<'material-ui/BottomNavigation'>;
}
declare module 'material-ui/Button/Button.js' {
  declare module.exports: $Exports<'material-ui/Button/Button'>;
}
declare module 'material-ui/Button/index.js' {
  declare module.exports: $Exports<'material-ui/Button'>;
}
declare module 'material-ui/ButtonBase/ButtonBase.js' {
  declare module.exports: $Exports<'material-ui/ButtonBase/ButtonBase'>;
}
declare module 'material-ui/ButtonBase/createRippleHandler.js' {
  declare module.exports: $Exports<
    'material-ui/ButtonBase/createRippleHandler'
  >;
}
declare module 'material-ui/ButtonBase/index.js' {
  declare module.exports: $Exports<'material-ui/ButtonBase'>;
}
declare module 'material-ui/ButtonBase/Ripple.js' {
  declare module.exports: $Exports<'material-ui/ButtonBase/Ripple'>;
}
declare module 'material-ui/ButtonBase/TouchRipple.js' {
  declare module.exports: $Exports<'material-ui/ButtonBase/TouchRipple'>;
}
declare module 'material-ui/Card/Card.js' {
  declare module.exports: $Exports<'material-ui/Card/Card'>;
}
declare module 'material-ui/Card/CardActions.js' {
  declare module.exports: $Exports<'material-ui/Card/CardActions'>;
}
declare module 'material-ui/Card/CardContent.js' {
  declare module.exports: $Exports<'material-ui/Card/CardContent'>;
}
declare module 'material-ui/Card/CardHeader.js' {
  declare module.exports: $Exports<'material-ui/Card/CardHeader'>;
}
declare module 'material-ui/Card/CardMedia.js' {
  declare module.exports: $Exports<'material-ui/Card/CardMedia'>;
}
declare module 'material-ui/Card/index.js' {
  declare module.exports: $Exports<'material-ui/Card'>;
}
declare module 'material-ui/Checkbox/Checkbox.js' {
  declare module.exports: $Exports<'material-ui/Checkbox/Checkbox'>;
}
declare module 'material-ui/Checkbox/index.js' {
  declare module.exports: $Exports<'material-ui/Checkbox'>;
}
declare module 'material-ui/Chip/Chip.js' {
  declare module.exports: $Exports<'material-ui/Chip/Chip'>;
}
declare module 'material-ui/Chip/index.js' {
  declare module.exports: $Exports<'material-ui/Chip'>;
}
declare module 'material-ui/colors/amber.js' {
  declare module.exports: $Exports<'material-ui/colors/amber'>;
}
declare module 'material-ui/colors/blue.js' {
  declare module.exports: $Exports<'material-ui/colors/blue'>;
}
declare module 'material-ui/colors/blueGrey.js' {
  declare module.exports: $Exports<'material-ui/colors/blueGrey'>;
}
declare module 'material-ui/colors/brown.js' {
  declare module.exports: $Exports<'material-ui/colors/brown'>;
}
declare module 'material-ui/colors/common.js' {
  declare module.exports: $Exports<'material-ui/colors/common'>;
}
declare module 'material-ui/colors/cyan.js' {
  declare module.exports: $Exports<'material-ui/colors/cyan'>;
}
declare module 'material-ui/colors/deepOrange.js' {
  declare module.exports: $Exports<'material-ui/colors/deepOrange'>;
}
declare module 'material-ui/colors/deepPurple.js' {
  declare module.exports: $Exports<'material-ui/colors/deepPurple'>;
}
declare module 'material-ui/colors/green.js' {
  declare module.exports: $Exports<'material-ui/colors/green'>;
}
declare module 'material-ui/colors/grey.js' {
  declare module.exports: $Exports<'material-ui/colors/grey'>;
}
declare module 'material-ui/colors/index.js' {
  declare module.exports: $Exports<'material-ui/colors'>;
}
declare module 'material-ui/colors/indigo.js' {
  declare module.exports: $Exports<'material-ui/colors/indigo'>;
}
declare module 'material-ui/colors/lightBlue.js' {
  declare module.exports: $Exports<'material-ui/colors/lightBlue'>;
}
declare module 'material-ui/colors/lightGreen.js' {
  declare module.exports: $Exports<'material-ui/colors/lightGreen'>;
}
declare module 'material-ui/colors/lime.js' {
  declare module.exports: $Exports<'material-ui/colors/lime'>;
}
declare module 'material-ui/colors/orange.js' {
  declare module.exports: $Exports<'material-ui/colors/orange'>;
}
declare module 'material-ui/colors/pink.js' {
  declare module.exports: $Exports<'material-ui/colors/pink'>;
}
declare module 'material-ui/colors/purple.js' {
  declare module.exports: $Exports<'material-ui/colors/purple'>;
}
declare module 'material-ui/colors/red.js' {
  declare module.exports: $Exports<'material-ui/colors/red'>;
}
declare module 'material-ui/colors/teal.js' {
  declare module.exports: $Exports<'material-ui/colors/teal'>;
}
declare module 'material-ui/colors/yellow.js' {
  declare module.exports: $Exports<'material-ui/colors/yellow'>;
}
declare module 'material-ui/Dialog/Dialog.js' {
  declare module.exports: $Exports<'material-ui/Dialog/Dialog'>;
}
declare module 'material-ui/Dialog/DialogActions.js' {
  declare module.exports: $Exports<'material-ui/Dialog/DialogActions'>;
}
declare module 'material-ui/Dialog/DialogContent.js' {
  declare module.exports: $Exports<'material-ui/Dialog/DialogContent'>;
}
declare module 'material-ui/Dialog/DialogContentText.js' {
  declare module.exports: $Exports<'material-ui/Dialog/DialogContentText'>;
}
declare module 'material-ui/Dialog/DialogTitle.js' {
  declare module.exports: $Exports<'material-ui/Dialog/DialogTitle'>;
}
declare module 'material-ui/Dialog/index.js' {
  declare module.exports: $Exports<'material-ui/Dialog'>;
}
declare module 'material-ui/Dialog/withMobileDialog.js' {
  declare module.exports: $Exports<'material-ui/Dialog/withMobileDialog'>;
}
declare module 'material-ui/Divider/Divider.js' {
  declare module.exports: $Exports<'material-ui/Divider/Divider'>;
}
declare module 'material-ui/Divider/index.js' {
  declare module.exports: $Exports<'material-ui/Divider'>;
}
declare module 'material-ui/Drawer/Drawer.js' {
  declare module.exports: $Exports<'material-ui/Drawer/Drawer'>;
}
declare module 'material-ui/Drawer/index.js' {
  declare module.exports: $Exports<'material-ui/Drawer'>;
}
declare module 'material-ui/ExpansionPanel/ExpansionPanel.js' {
  declare module.exports: $Exports<'material-ui/ExpansionPanel/ExpansionPanel'>;
}
declare module 'material-ui/ExpansionPanel/ExpansionPanelActions.js' {
  declare module.exports: $Exports<
    'material-ui/ExpansionPanel/ExpansionPanelActions'
  >;
}
declare module 'material-ui/ExpansionPanel/ExpansionPanelDetails.js' {
  declare module.exports: $Exports<
    'material-ui/ExpansionPanel/ExpansionPanelDetails'
  >;
}
declare module 'material-ui/ExpansionPanel/ExpansionPanelSummary.js' {
  declare module.exports: $Exports<
    'material-ui/ExpansionPanel/ExpansionPanelSummary'
  >;
}
declare module 'material-ui/ExpansionPanel/index.js' {
  declare module.exports: $Exports<'material-ui/ExpansionPanel'>;
}
declare module 'material-ui/Form/FormControl.js' {
  declare module.exports: $Exports<'material-ui/Form/FormControl'>;
}
declare module 'material-ui/Form/FormControlLabel.js' {
  declare module.exports: $Exports<'material-ui/Form/FormControlLabel'>;
}
declare module 'material-ui/Form/FormGroup.js' {
  declare module.exports: $Exports<'material-ui/Form/FormGroup'>;
}
declare module 'material-ui/Form/FormHelperText.js' {
  declare module.exports: $Exports<'material-ui/Form/FormHelperText'>;
}
declare module 'material-ui/Form/FormLabel.js' {
  declare module.exports: $Exports<'material-ui/Form/FormLabel'>;
}
declare module 'material-ui/Form/index.js' {
  declare module.exports: $Exports<'material-ui/Form'>;
}
declare module 'material-ui/Grid/Grid.js' {
  declare module.exports: $Exports<'material-ui/Grid/Grid'>;
}
declare module 'material-ui/Grid/index.js' {
  declare module.exports: $Exports<'material-ui/Grid'>;
}
declare module 'material-ui/GridList/GridList.js' {
  declare module.exports: $Exports<'material-ui/GridList/GridList'>;
}
declare module 'material-ui/GridList/GridListTile.js' {
  declare module.exports: $Exports<'material-ui/GridList/GridListTile'>;
}
declare module 'material-ui/GridList/GridListTileBar.js' {
  declare module.exports: $Exports<'material-ui/GridList/GridListTileBar'>;
}
declare module 'material-ui/GridList/index.js' {
  declare module.exports: $Exports<'material-ui/GridList'>;
}
declare module 'material-ui/Hidden/Hidden.js' {
  declare module.exports: $Exports<'material-ui/Hidden/Hidden'>;
}
declare module 'material-ui/Hidden/HiddenCss.js' {
  declare module.exports: $Exports<'material-ui/Hidden/HiddenCss'>;
}
declare module 'material-ui/Hidden/HiddenJs.js' {
  declare module.exports: $Exports<'material-ui/Hidden/HiddenJs'>;
}
declare module 'material-ui/Hidden/index.js' {
  declare module.exports: $Exports<'material-ui/Hidden'>;
}
declare module 'material-ui/Hidden/types.js' {
  declare module.exports: $Exports<'material-ui/Hidden/types'>;
}
declare module 'material-ui/Icon/Icon.js' {
  declare module.exports: $Exports<'material-ui/Icon/Icon'>;
}
declare module 'material-ui/Icon/index.js' {
  declare module.exports: $Exports<'material-ui/Icon'>;
}
declare module 'material-ui/IconButton/IconButton.js' {
  declare module.exports: $Exports<'material-ui/IconButton/IconButton'>;
}
declare module 'material-ui/IconButton/index.js' {
  declare module.exports: $Exports<'material-ui/IconButton'>;
}
declare module 'material-ui/Input/index.js' {
  declare module.exports: $Exports<'material-ui/Input'>;
}
declare module 'material-ui/Input/Input.js' {
  declare module.exports: $Exports<'material-ui/Input/Input'>;
}
declare module 'material-ui/Input/InputAdornment.js' {
  declare module.exports: $Exports<'material-ui/Input/InputAdornment'>;
}
declare module 'material-ui/Input/InputLabel.js' {
  declare module.exports: $Exports<'material-ui/Input/InputLabel'>;
}
declare module 'material-ui/Input/Textarea.js' {
  declare module.exports: $Exports<'material-ui/Input/Textarea'>;
}
declare module 'material-ui/internal/dom.js' {
  declare module.exports: $Exports<'material-ui/internal/dom'>;
}
declare module 'material-ui/Portal/Portal.js' {
  declare module.exports: $Exports<'material-ui/Portal/Portal'>;
}
declare module 'material-ui/internal/transition.js' {
  declare module.exports: $Exports<'material-ui/internal/transition'>;
}
declare module 'material-ui/List/index.js' {
  declare module.exports: $Exports<'material-ui/List'>;
}
declare module 'material-ui/List/List.js' {
  declare module.exports: $Exports<'material-ui/List/List'>;
}
declare module 'material-ui/List/ListItem.js' {
  declare module.exports: $Exports<'material-ui/List/ListItem'>;
}
declare module 'material-ui/List/ListItemAvatar.js' {
  declare module.exports: $Exports<'material-ui/List/ListItemAvatar'>;
}
declare module 'material-ui/List/ListItemIcon.js' {
  declare module.exports: $Exports<'material-ui/List/ListItemIcon'>;
}
declare module 'material-ui/List/ListItemSecondaryAction.js' {
  declare module.exports: $Exports<'material-ui/List/ListItemSecondaryAction'>;
}
declare module 'material-ui/List/ListItemText.js' {
  declare module.exports: $Exports<'material-ui/List/ListItemText'>;
}
declare module 'material-ui/List/ListSubheader.js' {
  declare module.exports: $Exports<'material-ui/List/ListSubheader'>;
}
declare module 'material-ui/Menu/index.js' {
  declare module.exports: $Exports<'material-ui/Menu'>;
}
declare module 'material-ui/Menu/Menu.js' {
  declare module.exports: $Exports<'material-ui/Menu/Menu'>;
}
declare module 'material-ui/Menu/MenuItem.js' {
  declare module.exports: $Exports<'material-ui/Menu/MenuItem'>;
}
declare module 'material-ui/Menu/MenuList.js' {
  declare module.exports: $Exports<'material-ui/Menu/MenuList'>;
}
declare module 'material-ui/MobileStepper/index.js' {
  declare module.exports: $Exports<'material-ui/MobileStepper'>;
}
declare module 'material-ui/MobileStepper/MobileStepper.js' {
  declare module.exports: $Exports<'material-ui/MobileStepper/MobileStepper'>;
}
declare module 'material-ui/Modal/Backdrop.js' {
  declare module.exports: $Exports<'material-ui/Modal/Backdrop'>;
}
declare module 'material-ui/Modal/index.js' {
  declare module.exports: $Exports<'material-ui/Modal'>;
}
declare module 'material-ui/Modal/Modal.js' {
  declare module.exports: $Exports<'material-ui/Modal/Modal'>;
}
declare module 'material-ui/Modal/modalManager.js' {
  declare module.exports: $Exports<'material-ui/Modal/modalManager'>;
}
declare module 'material-ui/Paper/index.js' {
  declare module.exports: $Exports<'material-ui/Paper'>;
}
declare module 'material-ui/Paper/Paper.js' {
  declare module.exports: $Exports<'material-ui/Paper/Paper'>;
}
declare module 'material-ui/Popover/index.js' {
  declare module.exports: $Exports<'material-ui/Popover'>;
}
declare module 'material-ui/Popover/Popover.js' {
  declare module.exports: $Exports<'material-ui/Popover/Popover'>;
}
declare module 'material-ui/Progress/CircularProgress.js' {
  declare module.exports: $Exports<'material-ui/Progress/CircularProgress'>;
}
declare module 'material-ui/Progress/index.js' {
  declare module.exports: $Exports<'material-ui/Progress'>;
}
declare module 'material-ui/Progress/LinearProgress.js' {
  declare module.exports: $Exports<'material-ui/Progress/LinearProgress'>;
}
declare module 'material-ui/Radio/index.js' {
  declare module.exports: $Exports<'material-ui/Radio'>;
}
declare module 'material-ui/Radio/Radio.js' {
  declare module.exports: $Exports<'material-ui/Radio/Radio'>;
}
declare module 'material-ui/Radio/RadioGroup.js' {
  declare module.exports: $Exports<'material-ui/Radio/RadioGroup'>;
}
declare module 'material-ui/Select/index.js' {
  declare module.exports: $Exports<'material-ui/Select'>;
}
declare module 'material-ui/Select/Select.js' {
  declare module.exports: $Exports<'material-ui/Select/Select'>;
}
declare module 'material-ui/Select/SelectInput.js' {
  declare module.exports: $Exports<'material-ui/Select/SelectInput'>;
}
declare module 'material-ui/Snackbar/index.js' {
  declare module.exports: $Exports<'material-ui/Snackbar'>;
}
declare module 'material-ui/Snackbar/Snackbar.js' {
  declare module.exports: $Exports<'material-ui/Snackbar/Snackbar'>;
}
declare module 'material-ui/Snackbar/SnackbarContent.js' {
  declare module.exports: $Exports<'material-ui/Snackbar/SnackbarContent'>;
}
declare module 'material-ui/Stepper/index.js' {
  declare module.exports: $Exports<'material-ui/Stepper'>;
}
declare module 'material-ui/Stepper/Step.js' {
  declare module.exports: $Exports<'material-ui/Stepper/Step'>;
}
declare module 'material-ui/Stepper/StepButton.js' {
  declare module.exports: $Exports<'material-ui/Stepper/StepButton'>;
}
declare module 'material-ui/Stepper/StepContent.js' {
  declare module.exports: $Exports<'material-ui/Stepper/StepContent'>;
}
declare module 'material-ui/Stepper/StepIcon.js' {
  declare module.exports: $Exports<'material-ui/Stepper/StepIcon'>;
}
declare module 'material-ui/Stepper/StepLabel.js' {
  declare module.exports: $Exports<'material-ui/Stepper/StepLabel'>;
}
declare module 'material-ui/Stepper/Stepper.js' {
  declare module.exports: $Exports<'material-ui/Stepper/Stepper'>;
}
declare module 'material-ui/styles/colorManipulator.js' {
  declare module.exports: $Exports<'material-ui/styles/colorManipulator'>;
}
declare module 'material-ui/styles/createBreakpoints.js' {
  declare module.exports: $Exports<'material-ui/styles/createBreakpoints'>;
}
declare module 'material-ui/styles/createGenerateClassName.js' {
  declare module.exports: $Exports<
    'material-ui/styles/createGenerateClassName'
  >;
}
declare module 'material-ui/styles/createMixins.js' {
  declare module.exports: $Exports<'material-ui/styles/createMixins'>;
}
declare module 'material-ui/styles/createMuiTheme.js' {
  declare module.exports: $Exports<'material-ui/styles/createMuiTheme'>;
}
declare module 'material-ui/styles/createPalette.js' {
  declare module.exports: $Exports<'material-ui/styles/createPalette'>;
}
declare module 'material-ui/styles/createTypography.js' {
  declare module.exports: $Exports<'material-ui/styles/createTypography'>;
}
declare module 'material-ui/styles/getStylesCreator.js' {
  declare module.exports: $Exports<'material-ui/styles/getStylesCreator'>;
}
declare module 'material-ui/styles/index.js' {
  declare module.exports: $Exports<'material-ui/styles'>;
}
declare module 'material-ui/styles/MuiThemeProvider.js' {
  declare module.exports: $Exports<'material-ui/styles/MuiThemeProvider'>;
}
declare module 'material-ui/styles/shadows.js' {
  declare module.exports: $Exports<'material-ui/styles/shadows'>;
}
declare module 'material-ui/styles/spacing.js' {
  declare module.exports: $Exports<'material-ui/styles/spacing'>;
}
declare module 'material-ui/styles/themeListener.js' {
  declare module.exports: $Exports<'material-ui/styles/themeListener'>;
}
declare module 'material-ui/styles/transitions.js' {
  declare module.exports: $Exports<'material-ui/styles/transitions'>;
}
declare module 'material-ui/styles/withStyles.js' {
  declare module.exports: $Exports<'material-ui/styles/withStyles'>;
}
declare module 'material-ui/styles/withTheme.js' {
  declare module.exports: $Exports<'material-ui/styles/withTheme'>;
}
declare module 'material-ui/styles/zIndex.js' {
  declare module.exports: $Exports<'material-ui/styles/zIndex'>;
}
declare module 'material-ui/svg-icons/ArrowDownward.js' {
  declare module.exports: $Exports<'material-ui/svg-icons/ArrowDownward'>;
}
declare module 'material-ui/svg-icons/ArrowDropDown.js' {
  declare module.exports: $Exports<'material-ui/svg-icons/ArrowDropDown'>;
}
declare module 'material-ui/svg-icons/Cancel.js' {
  declare module.exports: $Exports<'material-ui/svg-icons/Cancel'>;
}
declare module 'material-ui/svg-icons/CheckBox.js' {
  declare module.exports: $Exports<'material-ui/svg-icons/CheckBox'>;
}
declare module 'material-ui/svg-icons/CheckBoxOutlineBlank.js' {
  declare module.exports: $Exports<
    'material-ui/svg-icons/CheckBoxOutlineBlank'
  >;
}
declare module 'material-ui/svg-icons/CheckCircle.js' {
  declare module.exports: $Exports<'material-ui/svg-icons/CheckCircle'>;
}
declare module 'material-ui/svg-icons/IndeterminateCheckBox.js' {
  declare module.exports: $Exports<
    'material-ui/svg-icons/IndeterminateCheckBox'
  >;
}
declare module 'material-ui/svg-icons/KeyboardArrowLeft.js' {
  declare module.exports: $Exports<'material-ui/svg-icons/KeyboardArrowLeft'>;
}
declare module 'material-ui/svg-icons/KeyboardArrowRight.js' {
  declare module.exports: $Exports<'material-ui/svg-icons/KeyboardArrowRight'>;
}
declare module 'material-ui/svg-icons/RadioButtonChecked.js' {
  declare module.exports: $Exports<'material-ui/svg-icons/RadioButtonChecked'>;
}
declare module 'material-ui/svg-icons/RadioButtonUnchecked.js' {
  declare module.exports: $Exports<
    'material-ui/svg-icons/RadioButtonUnchecked'
  >;
}
declare module 'material-ui/SvgIcon/index.js' {
  declare module.exports: $Exports<'material-ui/SvgIcon'>;
}
declare module 'material-ui/SvgIcon/SvgIcon.js' {
  declare module.exports: $Exports<'material-ui/SvgIcon/SvgIcon'>;
}
declare module 'material-ui/Switch/index.js' {
  declare module.exports: $Exports<'material-ui/Switch'>;
}
declare module 'material-ui/Switch/Switch.js' {
  declare module.exports: $Exports<'material-ui/Switch/Switch'>;
}
declare module 'material-ui/Table/index.js' {
  declare module.exports: $Exports<'material-ui/Table'>;
}
declare module 'material-ui/Table/Table.js' {
  declare module.exports: $Exports<'material-ui/Table/Table'>;
}
declare module 'material-ui/Table/TableBody.js' {
  declare module.exports: $Exports<'material-ui/Table/TableBody'>;
}
declare module 'material-ui/Table/TableCell.js' {
  declare module.exports: $Exports<'material-ui/Table/TableCell'>;
}
declare module 'material-ui/Table/TableFooter.js' {
  declare module.exports: $Exports<'material-ui/Table/TableFooter'>;
}
declare module 'material-ui/Table/TableHead.js' {
  declare module.exports: $Exports<'material-ui/Table/TableHead'>;
}
declare module 'material-ui/Table/TablePagination.js' {
  declare module.exports: $Exports<'material-ui/Table/TablePagination'>;
}
declare module 'material-ui/Table/TableRow.js' {
  declare module.exports: $Exports<'material-ui/Table/TableRow'>;
}
declare module 'material-ui/Table/TableSortLabel.js' {
  declare module.exports: $Exports<'material-ui/Table/TableSortLabel'>;
}
declare module 'material-ui/Tabs/index.js' {
  declare module.exports: $Exports<'material-ui/Tabs'>;
}
declare module 'material-ui/Tabs/Tab.js' {
  declare module.exports: $Exports<'material-ui/Tabs/Tab'>;
}
declare module 'material-ui/Tabs/Tabs.js' {
  declare module.exports: $Exports<'material-ui/Tabs/Tabs'>;
}
declare module 'material-ui/TextField/index.js' {
  declare module.exports: $Exports<'material-ui/TextField'>;
}
declare module 'material-ui/TextField/TextField.js' {
  declare module.exports: $Exports<'material-ui/TextField/TextField'>;
}
declare module 'material-ui/Toolbar/index.js' {
  declare module.exports: $Exports<'material-ui/Toolbar'>;
}
declare module 'material-ui/Toolbar/Toolbar.js' {
  declare module.exports: $Exports<'material-ui/Toolbar/Toolbar'>;
}
declare module 'material-ui/Tooltip/index.js' {
  declare module.exports: $Exports<'material-ui/Tooltip'>;
}
declare module 'material-ui/Tooltip/Tooltip.js' {
  declare module.exports: $Exports<'material-ui/Tooltip/Tooltip'>;
}
declare module 'material-ui/transitions/Collapse.js' {
  declare module.exports: $Exports<'material-ui/transitions/Collapse'>;
}
declare module 'material-ui/transitions/Fade.js' {
  declare module.exports: $Exports<'material-ui/transitions/Fade'>;
}
declare module 'material-ui/transitions/Grow.js' {
  declare module.exports: $Exports<'material-ui/transitions/Grow'>;
}
declare module 'material-ui/transitions/index.js' {
  declare module.exports: $Exports<'material-ui/transitions'>;
}
declare module 'material-ui/transitions/Slide.js' {
  declare module.exports: $Exports<'material-ui/transitions/Slide'>;
}
declare module 'material-ui/Typography/index.js' {
  declare module.exports: $Exports<'material-ui/Typography'>;
}
declare module 'material-ui/Typography/Typography.js' {
  declare module.exports: $Exports<'material-ui/Typography/Typography'>;
}
declare module 'material-ui/utils/addEventListener.js' {
  declare module.exports: $Exports<'material-ui/utils/addEventListener'>;
}
declare module 'material-ui/utils/ClickAwayListener.js' {
  declare module.exports: $Exports<'material-ui/utils/ClickAwayListener'>;
}
declare module 'material-ui/utils/exactProp.js' {
  declare module.exports: $Exports<'material-ui/utils/exactProp'>;
}
declare module 'material-ui/utils/helpers.js' {
  declare module.exports: $Exports<'material-ui/utils/helpers'>;
}
declare module 'material-ui/utils/keyboardFocus.js' {
  declare module.exports: $Exports<'material-ui/utils/keyboardFocus'>;
}
declare module 'material-ui/utils/manageAriaHidden.js' {
  declare module.exports: $Exports<'material-ui/utils/manageAriaHidden'>;
}
declare module 'material-ui/utils/reactHelpers.js' {
  declare module.exports: $Exports<'material-ui/utils/reactHelpers'>;
}
declare module 'material-ui/utils/requirePropFactory.js' {
  declare module.exports: $Exports<'material-ui/utils/requirePropFactory'>;
}
declare module 'material-ui/utils/withWidth.js' {
  declare module.exports: $Exports<'material-ui/utils/withWidth'>;
}
