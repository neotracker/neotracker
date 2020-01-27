import { Context } from '../types';

export type MigrationName = string;
export type MigrationFunc = (context: Context, name: string) => Promise<void>;

// tslint:disable-next-line export-name
export const migrations: ReadonlyArray<readonly [string, MigrationFunc]> = [];
