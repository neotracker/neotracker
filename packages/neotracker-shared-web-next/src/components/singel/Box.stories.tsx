import { storiesOf } from '@storybook/react';
import base from 'paths.macro';
import * as React from 'react';
import { Box } from './Box';

storiesOf(`${base}/Button`, module)
  .add('with text', () => <Box>Hello Box</Box>)
  .add('with more text', () => <Box>Hello Box More</Box>);
