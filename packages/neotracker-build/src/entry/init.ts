// tslint:disable no-import-side-effect no-submodule-imports
import 'cross-fetch/polyfill';
import 'css.escape';
import { setObservableConfig } from 'recompose';
import { from } from 'rxjs';

setObservableConfig({
  fromESObservable: from,
});
