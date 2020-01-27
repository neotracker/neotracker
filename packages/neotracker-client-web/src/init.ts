// tslint:disable-next-line no-import-side-effect
import '@babel/polyfill';
import { setObservableConfig } from 'recompose';
import { Observable } from 'rxjs';
// tslint:disable-next-line no-import-side-effect
import 'whatwg-fetch';

setObservableConfig({
  // tslint:disable-next-line no-any
  fromESObservable: (obs$) => new Observable<any>((subscriber) => obs$.subscribe(subscriber)),
});
