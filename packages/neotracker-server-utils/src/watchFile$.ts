import chokidar from 'chokidar';
import { Observable, Observer } from 'rxjs';

type Event = 'change' | 'add' | 'delete';
// tslint:disable-next-line export-name
export const watchFile$ = (file: string): Observable<Event> =>
  Observable.create((observer: Observer<Event>) => {
    const watcher = chokidar.watch(file, { ignoreInitial: false });
    watcher.on('add', () => {
      observer.next('add');
    });
    watcher.on('change', () => {
      observer.next('change');
    });
    watcher.on('error', (error) => {
      observer.error(error);
    });
    watcher.on('unlink', () => {
      observer.next('delete');
    });

    return () => {
      watcher.close();
    };
  });
