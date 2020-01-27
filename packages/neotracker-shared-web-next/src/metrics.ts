import { AggregationType, globalStats, MeasureUnit } from '@neo-one/client-switch';

export const sessionCounter = globalStats.createMeasureInt64('neotracker/sessions', MeasureUnit.UNIT);
export const NEOTRACKER_SESSION = globalStats.createView(
  'neotracker_session',
  sessionCounter,
  AggregationType.COUNT,
  [],
  'count of total neotracker sessions',
);
globalStats.registerView(NEOTRACKER_SESSION);
