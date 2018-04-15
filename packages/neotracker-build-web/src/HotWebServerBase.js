/* @flow */
import { HotCompilerServer, runCompiler } from 'neotracker-build-utils';

import type webpack from 'webpack';

import { configuration } from './common';
import {
  createGraphQLCompiler,
  createRelayCodegenRunner,
  executeGraphQLCompiler,
} from './compiler';

export default class HotWebServer extends HotCompilerServer {
  clientCompiler: webpack;
  clientWatcher: ?Object;
  clientCompiling: boolean;
  graphqlWatcher: ?Object;
  graphqlEntryPath: string;
  graphqlOutputPath: string;
  graphqlSchemaOutputPath: string;
  jsonOutputPath: string;

  constructor({
    serverCompiler,
    clientCompiler,
    graphqlEntryPath,
    graphqlOutputPath,
    graphqlSchemaOutputPath,
    jsonOutputPath,
    env = {},
  }: {|
    serverCompiler: webpack,
    clientCompiler: webpack,
    graphqlEntryPath: string,
    graphqlOutputPath: string,
    graphqlSchemaOutputPath: string,
    jsonOutputPath: string,
    env?: Object,
  |}) {
    super({
      title: 'web',
      compiler: serverCompiler,
      env,
    });
    this.clientCompiler = clientCompiler;
    this.clientWatcher = null;
    this.clientCompiling = false;
    this.graphqlWatcher = null;
    this.graphqlEntryPath = graphqlEntryPath;
    this.graphqlOutputPath = graphqlOutputPath;
    this.graphqlSchemaOutputPath = graphqlSchemaOutputPath;
    this.jsonOutputPath = jsonOutputPath;
  }

  async start(): Promise<void> {
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
    this.graphqlWatcher = graphqlCompiler.watch(null, () => {});

    const codegenRunner = createRelayCodegenRunner({
      srcDirs: configuration.relaySrcDirs,
      schemaPath: this.graphqlSchemaOutputPath,
    });
    await codegenRunner.clearAll();
    await codegenRunner.watchAll();

    const { clientCompiler } = this;
    await new Promise(resolve => {
      clientCompiler.plugin('compile', () => {
        this.clientCompiling = true;
      });
      clientCompiler.plugin('done', stats => {
        if (!stats.hasErrors()) {
          this.clientCompiling = false;
          resolve(clientCompiler);
          this.killServer().then(() => this.startServer());
        }
      });
      this.clientWatcher = clientCompiler.watch(null, () => undefined);
    });

    await super.start();
  }

  async stop(): Promise<void> {
    await super.stop();
    const { clientWatcher, graphqlWatcher } = this;
    if (clientWatcher != null) {
      await new Promise(resolve => clientWatcher.close(resolve));
      this.clientWatcher = null;
    }

    if (graphqlWatcher != null) {
      await new Promise(resolve => graphqlWatcher.close(resolve));
      this.graphqlWatcher = null;
    }
  }

  async delayServerStart(): Promise<void> {
    await super.delayServerStart();
    if (this.clientCompiling) {
      await new Promise(resolve => setTimeout(() => resolve(), 50));
      await this.delayServerStart();
    }
  }
}
