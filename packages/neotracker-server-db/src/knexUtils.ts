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
