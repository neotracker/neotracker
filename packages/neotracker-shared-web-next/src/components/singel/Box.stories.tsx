import { text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { withInfo } from 'neotracker-storybook-utils';
import * as React from 'react';
import { Box } from './Box';

storiesOf(`components/singel/Box`, module)
  .add(
    'Docs',
    withInfo(`
  \`Box\` is very minimal, consisting only of a slightly rounded border style. In all other aspects it is identical to Base.
  `)(() => <Box>{text('Content', 'Hello Box')}</Box>),
  )
  .add('Hello Box [snapshot]', () => <Box>Hello Box</Box>);
