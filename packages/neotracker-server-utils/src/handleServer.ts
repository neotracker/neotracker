import { Monitor } from '@neo-one/monitor';
import http from 'http';
import https from 'https';
import Application from 'koa';

interface ListenOptions {
  readonly port: number;
  readonly host: string;
}
type Listener = ((request: http.IncomingMessage, response: http.ServerResponse) => void);
export interface HandleServerResult<T extends http.Server | https.Server> {
  readonly server: T | undefined;
  readonly listener: Listener | undefined;
  readonly app: Application | undefined;
}

export async function handleServer<T extends http.Server | https.Server, TOptions extends ListenOptions>({
  monitor,
  createServer,
  options,
  app,
  keepAliveTimeoutMS,
  prevResult = { app: undefined, listener: undefined, server: undefined },
}: {
  readonly monitor: Monitor;
  readonly createServer: ((options: TOptions) => T);
  readonly options?: TOptions | undefined;
  readonly app: Application;
  readonly keepAliveTimeoutMS?: number;
  readonly prevResult?: HandleServerResult<T> | undefined;
}): Promise<HandleServerResult<T>> {
  const { app: prevApp, listener: prevListener, server: prevServer } = prevResult;

  let server = prevServer;
  let listener = prevListener;
  if (options !== undefined) {
    const startServer = server === undefined;
    const safeServer = server === undefined ? createServer(options) : server;
    server = safeServer;

    if (app !== prevApp || prevListener === undefined) {
      if (prevListener !== undefined) {
        server.removeListener('request', prevListener);
      }

      listener = app.callback();
      server.on('request', listener);
    }

    if (keepAliveTimeoutMS !== undefined) {
      // tslint:disable-next-line no-object-mutation
      server.keepAliveTimeout = keepAliveTimeoutMS;
    }

    if (startServer) {
      const { host, port } = options;
      await new Promise<void>((resolve) => safeServer.listen(port, host, 511, resolve));

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
