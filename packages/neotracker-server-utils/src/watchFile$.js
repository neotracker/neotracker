/* @flow */
import { Observable } from 'rxjs';

import chokidar from 'chokidar';

type Event = 'change' | 'add' | 'delete';
export default (file: string): Observable<Event> =>
  Observable.create(observer => {
    const watcher = chokidar.watch(file, { ignoreInitial: false });
    watcher.on('add', () => {
      observer.next('add');
    });
    watcher.on('change', () => {
      observer.next('change');
    });
    watcher.on('error', error => {
      observer.error(error);
    });
    watcher.on('unlink', () => {
      observer.next('delete');
    });
    return () => {
      watcher.close();
    };
  });
