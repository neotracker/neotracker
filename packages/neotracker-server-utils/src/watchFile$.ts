import { Observable, Observer } from 'rxjs';

type Event = 'change' | 'add' | 'delete';
// tslint:disable-next-line export-name
export const watchFile$ = (file: string): Observable<Event> =>
  new Observable((observer: Observer<Event>) => {
    // We inline the require because chokidar is a really expensive module to load
    // tslint:disable-next-line no-require-imports
    const watcher = require('chokidar').watch(file, { ignoreInitial: false });
    watcher.on('add', () => {
      observer.next('add');
    });
    watcher.on('change', () => {
      observer.next('change');
    });
    watcher.on('error', (error: Error) => {
      observer.error(error);
    });
    watcher.on('unlink', () => {
      observer.next('delete');
    });

    return () => {
      watcher.close();
    };
  });
