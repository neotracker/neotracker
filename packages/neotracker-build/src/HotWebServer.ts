import { createClientCompiler, createServerCompiler } from './compiler';
import { HotWebServerBase } from './HotWebServerBase';

export class HotWebServer extends HotWebServerBase {
  public constructor({
    clientBundlePath,
    clientAssetsPath,
    env,
  }: {
    readonly clientBundlePath: string;
    readonly clientAssetsPath: string;
    readonly env?: object;
  }) {
    const options = {
      serverCompiler: createServerCompiler({ buildVersion: 'dev' }),
      clientCompiler: createClientCompiler({
        clientBundlePath,
        clientAssetsPath,
        buildVersion: 'dev',
      }),
      graphqlEntryPath: './packages/neotracker-build/src/entry/graphql.ts',
      graphqlOutputPath: './build/graphql',
      graphqlSchemaOutputPath: './build/graphql/schema.graphql',
      jsonOutputPath: './build/graphql/schema.graphql.json',
      env,
    };
    super(options);
  }
}
