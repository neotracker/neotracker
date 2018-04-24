/* @flow */
import { from } from 'rxjs/observable/from';
// $FlowFixMe
import { setObservableConfig } from 'recompose';

setObservableConfig({
  fromESObservable: from,
});
