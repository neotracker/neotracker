import { Monitor } from '@neo-one/monitor';
import { Context } from '../types';

export type MigrationName = string;
export type MigrationFunc = (context: Context, rootMonitor: Monitor, name: string) => Promise<void>;

// tslint:disable-next-line export-name
export const migrations: ReadonlyArray<[string, MigrationFunc]> = [];
