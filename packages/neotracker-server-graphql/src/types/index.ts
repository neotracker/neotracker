import { Type } from '../lib';
import { CurrentPrice } from './CurrentPrice';
import { Filter } from './Filter';
import { OrderBy } from './OrderBy';
import { PageInfo } from './PageInfo';
import { Script } from './Script';

export { CurrentPrice, Filter, OrderBy, PageInfo, Script };

// tslint:disable-next-line export-name
export const types: ReadonlyArray<typeof Type> = [CurrentPrice, Filter, OrderBy, PageInfo, Script];
