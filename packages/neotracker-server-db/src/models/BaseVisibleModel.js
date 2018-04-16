/* @flow */
import { BaseModel, type QueryContext } from '../lib';

export default class BaseVisibleModel extends BaseModel {
  // eslint-disable-next-line
  async canView(context: QueryContext): Promise<boolean> {
    return true;
  }
}
