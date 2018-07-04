import Knex from 'knex';

function getDialect(knex: Knex): string | undefined {
  if (knex.client !== undefined && knex.client.dialect !== undefined) {
    return knex.client.dialect;
  }

  return undefined;
}

export function isPostgres(knex: Knex): boolean {
  return getDialect(knex) === 'postgresql';
}

export function isMySql(knex: Knex): boolean {
  return getDialect(knex) === 'mysql';
}

export function isSqlite(knex: Knex): boolean {
  return getDialect(knex) === 'sqlite3';
}

export function isMsSql(knex: Knex): boolean {
  return getDialect(knex) === 'mssql';
}

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
