/* @flow */
import type http from 'http';
import type https from 'https';

import type { HandleServerResult } from './handleServer';

export default async (
  result: ?HandleServerResult<http.Server | https.Server>,
) => {
  if (result != null && result.server != null) {
    const { server } = result;
    await new Promise(resolve => server.close(() => resolve()));
  }
};
