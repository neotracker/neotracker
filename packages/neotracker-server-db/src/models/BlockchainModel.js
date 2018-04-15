/* @flow */
import type { Observable } from 'rxjs/Observable';

import { pubsub } from 'neotracker-server-utils';

import { PROCESSED_NEXT_INDEX } from '../channels';
import BaseVisibleModel from './BaseVisibleModel';
import type { GraphQLContext } from '../types';

export default class BlockchainModel extends BaseVisibleModel {
  static cacheType = 'blockchain';

  static observable(
    obj: Object,
    args: Object,
    context: GraphQLContext,
    // eslint-disable-next-line
    info: any,
  ): Observable<any> {
    return pubsub.observable(PROCESSED_NEXT_INDEX);
  }
}
