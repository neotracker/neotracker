import { QueryDeduplicator } from '@neotracker/shared-graphql';
import { ApolloLink, FetchResult, Observable, Operation } from 'apollo-link';
import { defer } from 'rxjs';

export class SchemaLink extends ApolloLink {
  public constructor(private readonly queryDeduplicator: QueryDeduplicator) {
    super();
  }

  // tslint:disable-next-line rxjs-finnish
  public request(operation: Operation): Observable<FetchResult> {
    const { variables } = operation;
    // tslint:disable-next-line no-any
    const id: string = (operation.query as any).id;

    return new Observable((subscriber) =>
      // tslint:disable-next-line no-any
      defer(async () => this.queryDeduplicator.execute({ id, variables })).subscribe(subscriber as any),
    );
  }
}
