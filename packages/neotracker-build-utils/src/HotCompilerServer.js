/* @flow */
import type { ChildProcess } from 'child_process';

import appRootDir from 'app-root-dir';
import execa from 'execa';
import path from 'path';
import type webpack from 'webpack';

import log from './log';
import logError from './logError';

export default class HotCompilerServer {
  title: string;
  compiler: webpack;
  env: Object;
  cwd: ?string;
  server: ?ChildProcess;
  watcher: ?Object;
  starting: boolean;
  disposing: boolean;
  compiling: boolean;

  constructor({
    title,
    compiler,
    env,
    cwd,
  }: {|
    title: string,
    compiler: webpack,
    env: Object,
    cwd?: string,
  |}) {
    this.title = title;
    this.compiler = compiler;
    this.env = env;
    this.cwd = cwd;
    this.server = null;
    this.watcher = null;
    this.starting = false;
    this.disposing = false;
    this.compiling = false;
  }

  async start(): Promise<void> {
    const { compiler } = this;

    compiler.plugin('compile', () => {
      this.compiling = true;
    });

    compiler.plugin('done', stats => {
      this.compiling = false;
      if (!this.disposing && !stats.hasErrors()) {
        this.startServer();
      }
    });

    // Lets start the compiler.
    this.watcher = compiler.watch(null, () => undefined);
  }

  async startServer(): Promise<void> {
    const { compiler } = this;

    const compiledEntryFile = path.resolve(
      appRootDir.get(),
      compiler.options.output.path,
      `${Object.keys(compiler.options.entry)[0]}.js`,
    );

    await this.delayServerStart();
    if (this.starting) {
      return;
    }
    this.starting = true;

    if (this.server) {
      await this.killServer();
      log({
        title: this.title,
        level: 'info',
        message: 'Restarting server...',
      });
    }

    const newServer = execa('node', [compiledEntryFile], {
      env: {
        ...process.env,
        ...this.env,
      },
      cwd: this.cwd == null ? undefined : this.cwd,
    });
    newServer.on('close', () => {
      if (this.server === newServer) {
        this.server = null;
      }
    });

    log({
      title: this.title,
      level: 'info',
      message: 'Server running with latest changes.',
    });

    newServer.stdout.on('data', data =>
      log({
        title: this.title,
        level: 'info',
        message: data.toString().trim(),
      }),
    );
    newServer.stderr.on('data', data => {
      logError({
        title: this.title,
        level: 'error',
        message: 'Error in server execution.',
        errorMessage: data.toString().trim(),
      });
    });
    this.server = newServer;
    this.starting = false;
  }

  async stop(): Promise<void> {
    this.disposing = true;

    const { watcher } = this;
    if (watcher != null) {
      await new Promise(resolve => watcher.close(resolve));
      this.watcher = null;
    }

    await this.killServer();
  }

  async killServer(): Promise<void> {
    const { server } = this;
    if (server == null) {
      return Promise.resolve();
    }
    this.server = null;

    let killed = false;
    const closePromise = new Promise(resolve =>
      server.on('close', () => {
        killed = true;
        resolve();
      }),
    );
    setTimeout(() => {
      if (!killed) {
        server.kill('SIGKILL');
      }
    }, 2000);

    server.kill('SIGINT');

    return closePromise;
  }

  async delayServerStart(): Promise<void> {
    if (this.compiling) {
      await new Promise(resolve => setTimeout(() => resolve(), 50));
      await this.delayServerStart();
    }
  }
}
