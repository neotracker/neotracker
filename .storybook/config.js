import { configure } from '@storybook/react';

const req = require.context(
  '../packages/neotracker-shared-web-next/src/components',
  true,
  /\.stories\.tsx$/,
);

function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
