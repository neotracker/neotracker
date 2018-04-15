/* @flow */
export default ({
  host,
  port,
  user,
  password,
  database,
  readWrite,
}: {|
  host?: string,
  port?: number,
  user?: string,
  password?: string,
  database?: string,
  readWrite?: boolean,
|}) => {
  let conn = 'postgresql://';
  if (user != null) {
    conn += user;
  }
  if (password != null) {
    conn += `:${password}`;
  }
  if (host != null) {
    if (user != null) {
      conn += `@`;
    }
    conn += host;
  }
  if (port != null) {
    conn += `:${port}`;
  }

  if (database != null) {
    conn += `/${database}`;
  }

  const hasOptions = readWrite != null;
  if (hasOptions) {
    conn += '?';
  }

  if (readWrite != null) {
    conn += `target_session_attrs=${readWrite ? 'read-write' : 'any'}`;
  }

  return conn;
};
