/* @flow */
// $FlowFixMe
import { from } from 'rxjs';
// $FlowFixMe
import { setObservableConfig } from 'recompose';

setObservableConfig({
  fromESObservable: from,
});
