import { HotCompilerServer, runCompiler } from 'neotracker-build-utils';
import webpack from 'webpack';
import { configuration } from './common';
import { createGraphQLCompiler, createRelayCodegenRunner, executeGraphQLCompiler } from './compiler';

export class HotWebServerBase extends HotCompilerServer {
  public readonly clientCompiler: webpack.Compiler;
  public mutableClientWatcher: webpack.Watching | undefined;
  public mutableClientCompiling: boolean;
  public mutableGraphQLWatcher: webpack.Watching | undefined;
  public readonly graphqlEntryPath: string;
  public readonly graphqlOutputPath: string;
  public readonly graphqlSchemaOutputPath: string;
  public readonly jsonOutputPath: string;

  public constructor({
    serverCompiler,
    clientCompiler,
    graphqlEntryPath,
    graphqlOutputPath,
    graphqlSchemaOutputPath,
    jsonOutputPath,
    env = {},
  }: {
    readonly serverCompiler: webpack.Compiler;
    readonly clientCompiler: webpack.Compiler;
    readonly graphqlEntryPath: string;
    readonly graphqlOutputPath: string;
    readonly graphqlSchemaOutputPath: string;
    readonly jsonOutputPath: string;
    readonly env?: object;
  }) {
    super({
      title: 'web',
      compiler: serverCompiler,
      env,
    });

    this.clientCompiler = clientCompiler;
    this.mutableClientCompiling = false;
    this.graphqlEntryPath = graphqlEntryPath;
    this.graphqlOutputPath = graphqlOutputPath;
    this.graphqlSchemaOutputPath = graphqlSchemaOutputPath;
    this.jsonOutputPath = jsonOutputPath;
  }

  public async start(): Promise<void> {
    const graphqlCompiler = createGraphQLCompiler({
      entryPath: this.graphqlEntryPath,
      outputPath: this.graphqlOutputPath,
      graphqlOutputPath: this.graphqlSchemaOutputPath,
      jsonOutputPath: this.jsonOutputPath,
      buildVersion: 'dev',
    });

    await runCompiler({ compiler: graphqlCompiler });
    // NOTE: Make sure that we actually have output since the compiler hook
    //       is not synchronous
    await executeGraphQLCompiler({
      compiler: graphqlCompiler,
      graphqlOutputPath: this.graphqlSchemaOutputPath,
      jsonOutputPath: this.jsonOutputPath,
    });

    this.mutableGraphQLWatcher = graphqlCompiler.watch({}, () => undefined);

    const codegenRunner = createRelayCodegenRunner({
      srcDirs: configuration.relaySrcDirs,
      schemaPath: this.graphqlSchemaOutputPath,
    });

    await codegenRunner.watchAll();

    const { clientCompiler } = this;
    await new Promise<void>((resolve) => {
      clientCompiler.hooks.compile.tap('HotWebServer', () => {
        this.mutableClientCompiling = true;
      });
      clientCompiler.hooks.done.tapPromise('HotWebServer', async (stats) => {
        if (!stats.hasErrors()) {
          this.mutableClientCompiling = false;
          resolve();
          await this.killServer();
          await this.startServer();
        }
      });
      this.mutableClientWatcher = clientCompiler.watch({}, () => undefined);
    });

    await super.start();
  }

  public async stop(): Promise<void> {
    await super.stop();
    const { mutableClientWatcher, mutableGraphQLWatcher } = this;
    if (mutableClientWatcher !== undefined) {
      await new Promise<void>((resolve) => mutableClientWatcher.close(resolve));
      this.mutableClientWatcher = undefined;
    }

    if (mutableGraphQLWatcher !== undefined) {
      await new Promise<void>((resolve) => mutableGraphQLWatcher.close(resolve));
      this.mutableGraphQLWatcher = undefined;
    }
  }

  public async delayServerStart(): Promise<void> {
    await super.delayServerStart();
    if (this.mutableClientCompiling) {
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      await this.delayServerStart();
    }
  }
}
