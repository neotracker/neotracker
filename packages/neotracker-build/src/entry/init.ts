// tslint:disable no-import-side-effect no-submodule-imports
import '@babel/polyfill';
import 'cross-fetch/polyfill';
import 'css.escape';
import { setObservableConfig } from 'recompose';
import { from } from 'rxjs';
import './polyfill';

setObservableConfig({
  fromESObservable: from,
});
