import React from 'react';
import { checkA11y } from '@storybook/addon-a11y';
import { configure, addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import * as appRootDir from 'app-root-dir';
import * as path from 'path';
import * as fs from 'fs-extra';

addDecorator(checkA11y);
addDecorator(withKnobs);

const files = [];
const regex = /\.stories\.tsx$/;
const scanDirectory = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.resolve(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDirectory(fullPath);
    } else if (regex.test(file)) {
      files.push(fullPath);
    }
  });
};

scanDirectory(
  path.resolve(
    appRootDir.get(),
    'packages',
    'neotracker-shared-web-next',
    'src',
    'components',
  ),
);

const loadStories = () => {
  files.forEach((filename) => require(filename));
};

configure(loadStories, module);
