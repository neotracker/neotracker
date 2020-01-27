// tslint:disable no-import-side-effect no-let ordered-imports
import './init';
import { getConfiguration } from '../getConfiguration';
import { NEOTracker } from '../NEOTracker';

const neotracker = new NEOTracker(getConfiguration());
neotracker.start();
