import { metrics } from '@neo-one/monitor';

// Note: Remove disable once more metrics have been added
// tslint:disable-next-line export-name
export const NEOTRACKER_SESSION = metrics.createCounter({
  name: 'neotracker_session',
});
