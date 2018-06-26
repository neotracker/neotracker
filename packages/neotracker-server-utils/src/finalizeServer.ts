import http from 'http';
import https from 'https';
import { HandleServerResult } from './handleServer';

export const finalizeServer = async (result: HandleServerResult<http.Server | https.Server> | undefined) => {
  if (result !== undefined && result.server !== undefined) {
    const { server } = result;
    await new Promise<void>((resolve) => server.close(resolve));
  }
};
