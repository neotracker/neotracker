import { killProcess } from '@neotracker/server-utils';
import execa from 'execa';
import webpack from 'webpack';
import { createRelayCodegenRunner, watchGraphQL } from './compiler';
import { HotCompilerServer } from './HotCompilerServer';

export class HotWebServerBase extends HotCompilerServer {
  private readonly clientCompiler: webpack.Compiler;
  private readonly clientCompilerNext: webpack.Compiler;
  private readonly isCI: boolean;
  private mutableClientWatcher: webpack.Watching | undefined;
  private mutableClientWatcherNext: webpack.Watching | undefined;
  private mutableClientCompiling: boolean;
  private mutableClientCompilingNext: boolean;
  private mutableGraphQLWatcher: webpack.Watching | undefined;
  private mutableGraphQLTypesProcess: execa.ExecaChildProcess | undefined;

  public constructor({
    serverCompiler,
    clientCompiler,
    clientCompilerNext,
    isCI,
    env = {},
  }: {
    readonly serverCompiler: webpack.Compiler;
    readonly clientCompiler: webpack.Compiler;
    readonly clientCompilerNext: webpack.Compiler;
    readonly isCI: boolean;
    readonly env?: object;
  }) {
    super({
      title: 'web',
      compiler: serverCompiler,
      env,
    });

    this.clientCompiler = clientCompiler;
    this.clientCompilerNext = clientCompilerNext;
    this.isCI = isCI;
    this.mutableClientCompiling = false;
    this.mutableClientCompilingNext = false;
  }

  public async start(): Promise<void> {
    this.mutableGraphQLWatcher = await watchGraphQL({ isCI: this.isCI });
    this.mutableGraphQLTypesProcess = execa('yarn', ['watch-gql-types']);
    const codegenRunner = createRelayCodegenRunner();
    await codegenRunner.watchAll();

    const { clientCompiler } = this;
    const { clientCompilerNext } = this;
    await Promise.all([
      new Promise<void>((resolve) => {
        clientCompiler.hooks.compile.tap('HotWebServer', () => {
          this.mutableClientCompiling = true;
        });
        clientCompiler.hooks.done.tapPromise('HotWebServer', async (stats) => {
          if (!stats.hasErrors()) {
            this.mutableClientCompiling = false;
            resolve();
            if (!this.mutableClientCompilingNext) {
              await this.killServer();
              await this.startServer();
            }
          }
        });
        this.mutableClientWatcher = clientCompiler.watch({}, () => undefined);
      }),
      new Promise<void>((resolve) => {
        clientCompilerNext.hooks.compile.tap('HotWebServer', () => {
          this.mutableClientCompilingNext = true;
        });
        clientCompilerNext.hooks.done.tapPromise('HotWebServer', async (stats) => {
          if (!stats.hasErrors()) {
            this.mutableClientCompilingNext = false;
            resolve();
            if (!this.mutableClientCompiling) {
              await this.killServer();
              await this.startServer();
            }
          }
        });
        this.mutableClientWatcherNext = clientCompilerNext.watch({}, () => undefined);
      }),
    ]);

    await super.start();
  }

  public async stop(): Promise<void> {
    await super.stop();
    const { mutableClientWatcher, mutableClientWatcherNext, mutableGraphQLWatcher, mutableGraphQLTypesProcess } = this;
    if (mutableClientWatcher !== undefined) {
      await new Promise<void>((resolve) => mutableClientWatcher.close(resolve));
      this.mutableClientWatcher = undefined;
    }

    if (mutableClientWatcherNext !== undefined) {
      await new Promise<void>((resolve) => mutableClientWatcherNext.close(resolve));
      this.mutableClientWatcherNext = undefined;
    }

    if (mutableGraphQLWatcher !== undefined) {
      await new Promise<void>((resolve) => mutableGraphQLWatcher.close(resolve));
      this.mutableGraphQLWatcher = undefined;
    }

    if (mutableGraphQLTypesProcess !== undefined) {
      await killProcess(mutableGraphQLTypesProcess);
      this.mutableGraphQLTypesProcess = undefined;
    }
  }

  public async delayServerStart(): Promise<void> {
    await super.delayServerStart();
    if (this.mutableClientCompiling || this.mutableClientCompilingNext) {
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      await this.delayServerStart();
    }
  }
}
