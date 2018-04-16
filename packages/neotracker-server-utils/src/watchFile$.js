/* @flow */
import { Observable } from 'rxjs/Observable';

import chokidar from 'chokidar';

type Event = 'change';
export default (file: string): Observable<Event> =>
  Observable.create(observer => {
    const watcher = chokidar.watch(file, { ignoreInitial: false });
    watcher.on('add', () => {
      observer.next('change');
    });
    watcher.on('change', () => {
      observer.next('change');
    });
    watcher.on('error', error => {
      observer.error(error);
    });
    watcher.on('unlink', () => {
      observer.error(new Error('Configuration file deleted.'));
    });
    return () => {
      watcher.close();
    };
  });
