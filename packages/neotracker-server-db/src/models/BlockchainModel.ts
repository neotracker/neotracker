import { pubsub } from '@neotracker/server-utils';
import { Observable } from 'rxjs';
import { PROCESSED_NEXT_INDEX } from '../createPubSub';
import { ID } from '../lib';
import { GraphQLContext } from '../types';
import { BaseVisibleModel } from './BaseVisibleModel';

export class BlockchainModel<TID extends ID> extends BaseVisibleModel<TID> {
  public static readonly cacheType = 'blockchain';

  // tslint:disable no-any
  public static observable$(_obj: any, _args: any, _context: GraphQLContext, _info: any): Observable<any> {
    return pubsub.observable$(PROCESSED_NEXT_INDEX);
  }
  // tslint:enable no-any
}
