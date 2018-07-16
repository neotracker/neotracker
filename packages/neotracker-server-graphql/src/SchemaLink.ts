import { ApolloLink, FetchResult, Observable, Operation } from 'apollo-link';
import { QueryDeduplicator } from 'neotracker-shared-graphql';
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
    const { monitor } = operation.getContext();

    // tslint:disable-next-line no-any
    return Observable.from(defer(async () => this.queryDeduplicator.execute({ id, variables, monitor })) as any);
  }
}
