// tslint:disable no-import-side-effect
import '@babel/polyfill';
import 'css.escape';
import { setObservableConfig } from 'recompose';
import { from } from 'rxjs';
import './polyfill';

setObservableConfig({
  fromESObservable: from,
});
