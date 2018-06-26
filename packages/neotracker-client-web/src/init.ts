// tslint:disable-next-line no-import-side-effect
import '@babel/polyfill';
// $FlowFixMe
import { setObservableConfig } from 'recompose';
// $FlowFixMe
import { from } from 'rxjs';
// tslint:disable-next-line no-import-side-effect
import 'whatwg-fetch';
// tslint:disable-next-line no-import-side-effect
import './polyfill';

setObservableConfig({
  fromESObservable: from,
});
