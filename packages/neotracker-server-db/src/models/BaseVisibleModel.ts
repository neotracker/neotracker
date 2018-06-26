import { QueryContext } from 'objection';

import { BaseModel, ID } from '../lib';

export class BaseVisibleModel<TID extends ID> extends BaseModel<TID> {
  public async canView(_context: QueryContext): Promise<boolean> {
    return true;
  }
}
