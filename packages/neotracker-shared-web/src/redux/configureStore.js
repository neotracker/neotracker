/* @flow */
import { createStore, combineReducers } from 'redux';

import reducers, { flip } from './index';

export default (isClient: boolean, initialState: Object = {}) => {
  const createReducer = (rootReducer: Object) =>
    combineReducers({ ...rootReducer });

  const store = createStore(createReducer(reducers()), initialState);

  if (isClient) {
    setInterval(() => store.dispatch(flip()), 1000);
  }

  return store;
};
