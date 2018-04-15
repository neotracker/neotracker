/* @flow */
import type { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

export default class PubSub {
  subjects: { [triggerName: string]: Subject<mixed> };
  observables: { [triggerName: string]: Observable<mixed> };

  constructor() {
    this.subjects = {};
    this.observables = {};
  }

  publish(triggerName: string, payload: mixed): void {
    this.subject(triggerName).next(payload);
  }

  subject(triggerName: string): Subject<mixed> {
    if (this.subjects[triggerName] == null) {
      this.subjects[triggerName] = new Subject();
    }

    return this.subjects[triggerName];
  }

  observable(triggerName: string): Observable<mixed> {
    if (this.observables[triggerName] == null) {
      this.observables[triggerName] = this.subject(triggerName);
    }

    return this.observables[triggerName];
  }
}
