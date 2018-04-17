/* @flow */
import { BaseModel, type ID, type QueryContext } from '../lib';

export default class BaseVisibleModel<TID: ID> extends BaseModel<TID> {
  // eslint-disable-next-line
  async canView(context: QueryContext): Promise<boolean> {
    return true;
  }
}
