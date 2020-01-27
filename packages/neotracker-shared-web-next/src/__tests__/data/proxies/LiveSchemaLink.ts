import { ApolloLink, FetchResult, Observable, Operation } from 'apollo-link';
import { GraphQLSchema } from 'graphql';
import { defer, merge } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getLiveQuery } from '../../../../../neotracker-server-graphql/src/live/getLiveQuery';

export class LiveSchemaLink extends ApolloLink {
  private readonly schema: GraphQLSchema;

  public constructor({ schema }: { readonly schema: GraphQLSchema }) {
    super();
    this.schema = schema;
  }

  // tslint:disable-next-line rxjs-finnish
  public request(operation: Operation): Observable<FetchResult> {
    const result$ = defer(async () => {
      const queries = await getLiveQuery({
        schema: this.schema,
        // tslint:disable-next-line no-any
        document: (operation as any).query,
        contextValue: {},
        rootValue: {},
        variableValues: operation.variables,
        createObservable: true,
      });

      // tslint:disable-next-line no-unused
      return queries.map(([_id, query$]) => query$);
    }).pipe(switchMap((queries$) => merge(...queries$)));

    // tslint:disable-next-line no-any
    return new Observable((subscriber) => result$.subscribe(subscriber as any));
  }
}
