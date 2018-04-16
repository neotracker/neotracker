/* @flow */
import { models } from 'neotracker-server-db';

import inputs from './inputs';
import makeSchema from './makeSchema';
import roots from './roots';
import types from './types';

export default makeSchema({
  models,
  roots,
  inputs,
  types,
});
