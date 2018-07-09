// tslint:disable no-import-side-effect ordered-imports
import 'jest-styled-components';
import initStoryshots from '@storybook/addon-storyshots';

initStoryshots({
  configPath: '.storybook/config.snap.js',
  storyNameRegex: /^.*\[snapshot\].*$/,
});
