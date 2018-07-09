import React from 'react';
import { checkA11y } from '@storybook/addon-a11y';
import { configure, addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';

addDecorator(checkA11y);
addDecorator(withKnobs);

const req = require.context(
  '../packages/neotracker-shared-web-next/src/components',
  true,
  /\.stories\.tsx?$/,
);

const loadStories = () => {
  req.keys().forEach((filename) => req(filename));
};

configure(loadStories, module);
