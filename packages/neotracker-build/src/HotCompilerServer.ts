import * as appRootDir from 'app-root-dir';
import { ChildProcess } from 'child_process';
import execa from 'execa';
import * as path from 'path';
import webpack from 'webpack';
import { HotServer } from './HotServer';
import { log } from './log';
import { logError } from './logError';

export class HotCompilerServer implements HotServer {
  public readonly title: string;
  public readonly compiler: webpack.Compiler;
  public readonly env: object;
  public readonly cwd: string | undefined;
  public mutableServer: ChildProcess | undefined;
  public mutableWatcher: webpack.Watching | undefined;
  public mutableStarting: boolean;
  public mutableDisposing: boolean;
  public mutableCompiling: boolean;

  public constructor({
    title,
    compiler,
    env,
    cwd,
  }: {
    readonly title: string;
    readonly compiler: webpack.Compiler;
    readonly env: object;
    readonly cwd?: string;
  }) {
    this.title = title;
    this.compiler = compiler;
    this.env = env;
    this.cwd = cwd;
    this.mutableStarting = false;
    this.mutableDisposing = false;
    this.mutableCompiling = false;
  }

  public async start(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      try {
        const { compiler } = this;

        compiler.hooks.compile.tap('HotCompilerServer', () => {
          this.mutableCompiling = true;
        });

        compiler.hooks.done.tapPromise('done', async (stats) => {
          this.mutableCompiling = false;
          if (!this.mutableDisposing && !stats.hasErrors()) {
            await this.startServer();
          }
        });

        this.mutableWatcher = compiler.watch({}, () => undefined);
      } catch (error) {
        reject(error);
      }
      resolve();
    });
  }

  public async startServer(): Promise<void> {
    const { compiler } = this;

    const compiledEntryFile = path.resolve(
      appRootDir.get(),
      // tslint:disable-next-line no-non-null-assertion
      compiler.options.output!.path!,
      // tslint:disable-next-line no-non-null-assertion
      `${Object.keys(compiler.options.entry!)[0]}.js`,
    );

    await this.delayServerStart();
    if (this.mutableStarting) {
      return;
    }
    this.mutableStarting = true;

    if (this.mutableServer) {
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
      cwd: this.cwd === undefined ? undefined : this.cwd,
    });

    newServer.on('close', () => {
      // tslint:disable-next-line: strict-comparisons
      if (this.mutableServer === newServer) {
        this.mutableServer = undefined;
      }
    });

    log({
      title: this.title,
      level: 'info',
      message: 'Server running with latest changes.',
    });
    if (newServer.stdout !== null) {
      newServer.stdout.on('data', (data) => {
        process.stdout.write(data);
      });
    }
    if (newServer.stderr !== null) {
      newServer.stderr.on('data', (data) => {
        logError({
          title: this.title,
          message: 'Error in server execution.',
          errorMessage: data.toString().trim(),
        });
      });
    }
    this.mutableServer = newServer;
    this.mutableStarting = false;
  }

  public async stop(): Promise<void> {
    this.mutableDisposing = true;

    const { mutableWatcher } = this;
    if (mutableWatcher !== undefined) {
      await new Promise<void>((resolve) => mutableWatcher.close(resolve));
      this.mutableWatcher = undefined;
    }

    await this.killServer();
  }

  public async killServer(): Promise<void> {
    const { mutableServer } = this;
    if (mutableServer === undefined) {
      return Promise.resolve();
    }
    this.mutableServer = undefined;

    let killed = false;
    const closePromise = new Promise<void>((resolve) =>
      mutableServer.on('close', () => {
        killed = true;
        resolve();
      }),
    );

    setTimeout(() => {
      if (!killed) {
        mutableServer.kill('SIGKILL');
      }
    }, 2000);

    mutableServer.kill('SIGINT');

    return closePromise;
  }

  public async delayServerStart(): Promise<void> {
    if (this.mutableCompiling) {
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      await this.delayServerStart();
    }
  }
}
