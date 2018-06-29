const PG_CONFLICT_ERROR_CODE = '23505';
const SQLITE_CONFLICT_ERROR_CODE = 'SQLITE_CONSTRAINT';

export function isUniqueError(driverName: string, error: NodeJS.ErrnoException): boolean {
  if (driverName === 'pg') {
    return error.code === PG_CONFLICT_ERROR_CODE;
  }

  if (driverName === 'sqlite3') {
    return error.code === SQLITE_CONFLICT_ERROR_CODE;
  }

  return false;
}
