/* @flow */
import amber from 'material-ui/colors/amber';
import blue from 'material-ui/colors/blue';
import blueGrey from 'material-ui/colors/blueGrey';
import brown from 'material-ui/colors/brown';
import cyan from 'material-ui/colors/cyan';
import deepOrange from 'material-ui/colors/deepOrange';
import deepPurple from 'material-ui/colors/deepPurple';
import green from 'material-ui/colors/green';
import grey from 'material-ui/colors/grey';
import indigo from 'material-ui/colors/indigo';
import lightBlue from 'material-ui/colors/lightBlue';
import lightGreen from 'material-ui/colors/lightGreen';
import lime from 'material-ui/colors/lime';
import orange from 'material-ui/colors/orange';
import pink from 'material-ui/colors/pink';
import purple from 'material-ui/colors/purple';
import red from 'material-ui/colors/red';
import teal from 'material-ui/colors/teal';
import yellow from 'material-ui/colors/yellow';
import createMuiTheme, {
  type Theme as MUITheme,
} from 'material-ui/styles/createMuiTheme';

const containerDownMDPad = {
  paddingLeft: 16,
  paddingRight: 16,
};
const containerDownMDPaddingTop = 16;
const titleDownMDNoHorizontalPad = {
  paddingBottom: 16,
  paddingTop: 16,
};
const titleDownMD = Object.assign(
  {},
  titleDownMDNoHorizontalPad,
  containerDownMDPad,
);
const containerUpMDPad = {
  paddingLeft: 24,
  paddingRight: 24,
};
const containerUpMDPaddingTop = 24;
const titleUpMDNoHorizontalPad = {
  paddingBottom: 24,
  paddingTop: 24,
};
const titleUpMD = Object.assign({}, titleUpMDNoHorizontalPad, containerUpMDPad);

export default () => {
  const theme = createMuiTheme({
    palette: {
      primary: lightGreen,
      secondary: deepPurple,
      error: red,
      type: 'light',
    },
  });
  const lightDivider = 'rgba(0, 0, 0, 0.075)';
  // $FlowFixMe
  theme.typography.button = {};
  // $FlowFixMe
  theme.custom = {
    lightDivider,
    containerDownMDPad,
    containerUpMDPad,
    containerDownMDPaddingTop,
    containerUpMDPaddingTop,
    titleDownMDNoHorizontalPad,
    titleUpMDNoHorizontalPad,
    titleDownMD,
    titleUpMD,
    comment: {
      borderTop: `1px solid ${lightDivider}`,
      paddingBottom: 16,
      paddingTop: 16,
    },
    colors: {
      amber,
      blue,
      blueGrey,
      brown,
      cyan,
      deepOrange,
      deepPurple,
      green,
      grey,
      indigo,
      lightBlue,
      lightGreen,
      lime,
      orange,
      pink,
      purple,
      red,
      teal,
      yellow,
      common: {
        black: '#000',
        white: '#fff',
        transparent: 'rgba(0, 0, 0, 0)',
        fullBlack: 'rgba(0, 0, 0, 1)',
        darkBlack: 'rgba(0, 0, 0, 0.87)',
        lightBlack: 'rgba(0, 0, 0, 0.54)',
        minBlack: 'rgba(0, 0, 0, 0.26)',
        faintBlack: 'rgba(0, 0, 0, 0.12)',
        fullWhite: 'rgba(255, 255, 255, 1)',
        darkWhite: 'rgba(255, 255, 255, 0.87)',
        lightWhite: 'rgba(255, 255, 255, 0.54)',
      },
    },
    inputOutput: {
      row: {
        alignItems: 'center',
        display: 'flex',
        height: theme.spacing.unit * 3,
      },
    },
    transactionColors: {
      contract: {
        color: teal,
        backgroundColor: teal[500],
      },
      miner: {
        color: blueGrey,
        backgroundColor: blueGrey[400],
      },
      issue: {
        color: green,
        backgroundColor: green[600],
      },
      claim: {
        color: purple,
        backgroundColor: purple.A200,
      },
      enrollment: {
        color: indigo,
        backgroundColor: indigo.A200,
      },
      register: {
        color: amber,
        backgroundColor: deepOrange.A400,
      },
      publish: {
        color: red,
        backgroundColor: red.A200,
      },
      invocation: {
        color: blue,
        backgroundColor: blue.A200,
      },
      state: {
        color: lime,
        backgroundColor: lime.A200,
      },
    },
    code: {
      text: {
        fontFamily: 'Menlo,Monaco,Consolas,"Courier New",monospace',
        fontSize: theme.typography.body1.fontSize,
        fontWeight: theme.typography.body1.fontWeight,
        lineHeight: theme.typography.body1.lineHeight,
        color: theme.palette.text.primary,
      },
    },
  };
  return theme;
};

type Color = {|
  '50': string,
  '100': string,
  '200': string,
  '300': string,
  '400': string,
  '500': string,
  '600': string,
  '700': string,
  '800': string,
  '900': string,
  A100: string,
  A200: string,
  A400: string,
  A700: string,
  contrastDefaultColor: string,
|};
type Text = {
  primary: string,
  secondary: string,
  disabled: string,
  hint: string,
  icon: string,
  divider: string,
  lightDivider: string,
};
type Action = {
  active: string,
  disabled: string,
};
type Background = {
  default: string,
  paper: string,
  appBar: string,
  contentFrame: string,
  status: string,
};
// eslint-disable-next-line
type Shade = {
  text: Text,
  action: Action,
  background: Background,
};
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Custom = {
  lightDivider: string,
  containerDownMDPad: {
    paddingLeft: number,
    paddingRight: number,
  },
  containerUpMDPad: {
    paddingLeft: number,
    paddingRight: number,
  },
  containerDownMDPaddingTop: number,
  containerUpMDPaddingTop: number,
  titleDownMDNoHorizontalPad: {
    paddingBottom: number,
    paddingTop: number,
  },
  titleUpMDNoHorizontalPad: {
    paddingBottom: number,
    paddingTop: number,
  },
  titleDownMD: {
    paddingBottom: number,
    paddingTop: number,
    paddingLeft: number,
    paddingRight: number,
  },
  titleUpMD: {
    paddingBottom: number,
    paddingTop: number,
    paddingLeft: number,
    paddingRight: number,
  },
  comment: Object,
  colors: {
    amber: Color,
    blue: Color,
    blueGrey: Color,
    brown: Color,
    cyan: Color,
    deepOrange: Color,
    deepPurple: Color,
    green: Color,
    grey: Color,
    indigo: Color,
    lightBlue: Color,
    lightGreen: Color,
    lime: Color,
    orange: Color,
    pink: Color,
    purple: Color,
    red: Color,
    teal: Color,
    yellow: Color,
    common: {
      black: string,
      white: string,
      transparent: string,
      fullBlack: string,
      darkBlack: string,
      lightBlack: string,
      minBlack: string,
      faintBlack: string,
      fullWhite: string,
      darkWhite: string,
      lightWhite: string,
    },
  },
  inputOutput: Object,
  transactionColors: {
    contract: {
      color: Color,
      backgroundColor: string,
    },
    miner: {
      color: Color,
      backgroundColor: string,
    },
    issue: {
      color: Color,
      backgroundColor: string,
    },
    claim: {
      color: Color,
      backgroundColor: string,
    },
    enrollment: {
      color: Color,
      backgroundColor: string,
    },
    register: {
      color: Color,
      backgroundColor: string,
    },
    publish: {
      color: Color,
      backgroundColor: string,
    },
    invocation: {
      color: Color,
      backgroundColor: string,
    },
    state: {
      color: Color,
      backgroundColor: string,
    },
  },
  code: {
    text: {
      fontFamily: string,
      fontSize: number | string,
      fontWeight: number | string,
      lineHeight: number | string,
      color: string,
    },
  },
};

export type Theme = {|
  ...MUITheme,
  custom: Custom,
|};
