import { text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { withInfo } from 'neotracker-storybook-utils';
import * as React from 'react';
import { Blockquote } from './Blockquote';

storiesOf(`components/singel/Blockquote`, module)
  .add(
    'Docs',
    withInfo(`
  \`Blockquote\` renders text with no borders.  By default it renders as a <blockquote>.  Supports basic styling via props.
  `)(() => <Blockquote>{text('Content', 'Hello Blockquote')}</Blockquote>),
  )
  .add('Hello Blockquote [snapshot]', () => <Blockquote>Hello Blockquote</Blockquote>);
