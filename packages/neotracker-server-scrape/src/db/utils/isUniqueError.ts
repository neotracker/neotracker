import Knex from 'knex';
import { isPostgres, isSqlite } from 'neotracker-server-db';

const PG_CONFLICT_ERROR_CODE = '23505';
const SQLITE_CONFLICT_ERROR_CODE = 'SQLITE_CONSTRAINT';

export function isUniqueError(db: Knex, error: NodeJS.ErrnoException): boolean {
  if (isPostgres(db)) {
    return error.code === PG_CONFLICT_ERROR_CODE;
  }

  if (isSqlite(db)) {
    return error.code === SQLITE_CONFLICT_ERROR_CODE;
  }

  return false;
}
