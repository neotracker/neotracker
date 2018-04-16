/* @flow */
import { from } from 'rxjs/observable/from';
import { setObservableConfig } from 'recompose';

setObservableConfig({
  fromESObservable: from,
});
