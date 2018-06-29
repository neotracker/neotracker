export const createConnectionString = ({
  host,
  port,
  user,
  password,
  database,
  readWrite,
}: {
  readonly type?: string;
  readonly host?: string;
  readonly port?: number;
  readonly user?: string;
  readonly password?: string;
  readonly database?: string;
  readonly readWrite?: boolean;
}) => {
  let conn = 'postgresql://';
  if (user !== undefined) {
    conn += user;
  }
  if (password !== undefined) {
    conn += `:${password}`;
  }
  if (host !== undefined) {
    if (user !== undefined) {
      conn += `@`;
    }
    conn += host;
  }
  if (port !== undefined) {
    conn += `:${port}`;
  }

  if (database !== undefined) {
    conn += `/${database}`;
  }

  const hasOptions = readWrite !== undefined;
  if (hasOptions) {
    conn += '?';
  }

  if (readWrite !== undefined) {
    conn += `target_session_attrs=${readWrite ? 'read-write' : 'any'}`;
  }

  return conn;
};
