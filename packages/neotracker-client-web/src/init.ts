// tslint:disable no-import-side-effect
import '@babel/polyfill';
import 'whatwg-fetch';
// tslint:disable-next-line ordered-imports
import { collectingMetrics, metrics } from '@neo-one/monitor';
import { setObservableConfig } from 'recompose';
import { from } from 'rxjs';

setObservableConfig({
  fromESObservable: from,
});

metrics.setFactory(collectingMetrics);
