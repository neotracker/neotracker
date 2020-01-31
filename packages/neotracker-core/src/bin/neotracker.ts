// tslint:disable no-import-side-effect no-let ordered-imports
import './init';
import { getCoreConfiguration } from '../getConfiguration';
import { NEOTracker } from '../NEOTracker';

const neotracker = new NEOTracker(getCoreConfiguration());
neotracker.start();
