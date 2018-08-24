// tslint:disable no-import-side-effect no-submodule-imports
import 'cross-fetch/polyfill';
import 'css.escape';
import { setObservableConfig } from 'recompose';
import { Observable } from 'rxjs';

setObservableConfig({
  // tslint:disable-next-line no-any
  fromESObservable: (obs$) => new Observable<any>((subscriber) => obs$.subscribe(subscriber)),
});
