/* @flow */
/* eslint-disable import/first */
import '@babel/polyfill';
import './polyfill';
import 'whatwg-fetch';
// $FlowFixMe
import { from } from 'rxjs';
// $FlowFixMe
import { setObservableConfig } from 'recompose';

setObservableConfig({
  fromESObservable: from,
});
