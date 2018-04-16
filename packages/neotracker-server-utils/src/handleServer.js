/* @flow */
import type Koa from 'koa';
import type { Monitor } from '@neo-one/monitor';

import type http from 'http';
import type https from 'https';

type ListenOptions = {
  port: number,
  host: string,
};

type Listener = (
  request: http.IncomingMessage,
  response: http.ServerResponse,
) => void;
export type HandleServerResult<T: http.Server | https.Server> = {|
  server: ?T,
  listener: ?Listener,
  app: Koa,
|};

async function handleServer<
  T: http.Server | https.Server,
  TOptions: ListenOptions,
>({
  monitor,
  createServer,
  options,
  app,
  keepAliveTimeoutMS,
  prevResult,
}: {|
  monitor: Monitor,
  createServer: (options: TOptions) => T,
  options?: ?TOptions,
  app: Koa,
  keepAliveTimeoutMS?: number,
  prevResult?: ?HandleServerResult<T>,
|}): Promise<HandleServerResult<T>> {
  const { app: prevApp, listener: prevListener, server: prevServer } =
    prevResult || {};

  let server = prevServer;
  let listener = prevListener;
  if (options != null) {
    const startServer = server == null;
    const safeServer = server == null ? createServer(options) : server;
    server = safeServer;

    if (app !== prevApp || prevListener == null) {
      if (prevListener != null) {
        server.removeListener('request', prevListener);
      }

      listener = app.callback();
      server.on('request', listener);
    }

    if (keepAliveTimeoutMS != null) {
      // $FlowFixMe
      server.keepAliveTimeout = keepAliveTimeoutMS;
    }

    if (startServer) {
      const { host, port } = options;
      await new Promise(resolve =>
        safeServer.listen(port, host, 511, () => resolve()),
      );
      monitor
        .withData({
          [monitor.labels.PEER_ADDRESS]: `${host}:${port}`,
          [monitor.labels.PEER_PORT]: port,
        })
        .log({
          name: 'server_listening',
          message: `Server listening on ${host}:${port}`,
        });
    }
  }

  return { server, listener, app };
}

export default handleServer;
