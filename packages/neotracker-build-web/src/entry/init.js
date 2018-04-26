/* @flow */
/* eslint-disable import/first */
import '@babel/polyfill';
import 'css.escape';
import './polyfill';
// $FlowFixMe
import { from } from 'rxjs';
// $FlowFixMe
import { setObservableConfig } from 'recompose';

setObservableConfig({
  fromESObservable: from,
});
