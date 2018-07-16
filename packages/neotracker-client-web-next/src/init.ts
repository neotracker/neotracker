// tslint:disable no-import-side-effect ordered-imports
import '@babel/polyfill';
import { collectingMetrics, metrics } from '@neo-one/monitor';

metrics.setFactory(collectingMetrics);
