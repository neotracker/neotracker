// tslint:disable no-any
import { Observable, Subject } from 'rxjs';

export class PubSub {
  // tslint:disable-next-line:readonly-keyword
  public readonly mutableSubjects: { [triggerName: string]: Subject<any> };
  // tslint:disable-next-line:readonly-keyword
  public readonly mutableObservables: { [triggerName: string]: Observable<any> };

  public constructor() {
    this.mutableSubjects = {};
    this.mutableObservables = {};
  }

  public publish(triggerName: string, payload: any): void {
    this.subject$(triggerName).next(payload);
  }

  public subject$(triggerName: string): Subject<any> {
    if ((this.mutableSubjects[triggerName] as Subject<any> | undefined) === undefined) {
      this.mutableSubjects[triggerName] = new Subject();
    }

    return this.mutableSubjects[triggerName];
  }

  public observable$(triggerName: string): Observable<any> {
    if ((this.mutableObservables[triggerName] as Observable<any> | undefined) === undefined) {
      this.mutableObservables[triggerName] = this.subject$(triggerName);
    }

    return this.mutableObservables[triggerName];
  }
}
