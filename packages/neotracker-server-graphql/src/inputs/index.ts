import { Input } from '../lib';
import { FilterInput } from './FilterInput';
import { OrderByInput } from './OrderByInput';

export { FilterInput, OrderByInput };

// tslint:disable-next-line export-name
export const inputs: ReadonlyArray<typeof Input> = [FilterInput, OrderByInput];
