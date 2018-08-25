import * as appRootDir from 'app-root-dir';
import fs from 'fs-extra';
import _ from 'lodash';
import * as path from 'path';
import stringify from 'safe-stable-stringify';
import yargs from 'yargs';
import { createClientCompiler, createClientCompilerNext, createNodeCompiler, runCompiler } from '../compiler';
import { log } from '../log';
import { logError } from '../logError';
import { setupProcessListeners } from '../setupProcessListeners';

const title = 'build';
yargs.describe('ci', 'Running as part of continuous integration').default('ci', false);

const NEOTRACKER = '@neotracker/';
const getTransitiveDependencies = async (
  pkgName: string,
  version: string,
): Promise<ReadonlyArray<[string, string]>> => {
  const fileName = pkgName.startsWith(NEOTRACKER) ? `neotracker-${pkgName.slice(NEOTRACKER.length)}` : undefined;
  if (fileName === undefined) {
    return [[pkgName, version]];
  }

  const pkgJSON: { [key: string]: string } = await fs.readJSON(
    path.resolve(appRootDir.get(), 'packages', fileName, 'package.json'),
  );

  const depss = await Promise.all(
    Object.entries(pkgJSON.dependencies).map(async ([key, value]) => getTransitiveDependencies(key, value)),
  );
  const mutableDeps: { [key: string]: string } = {};
  depss.forEach((depArray) =>
    depArray.forEach(([key, value]) => {
      mutableDeps[key] = value;
    }),
  );

  return Object.entries(mutableDeps);
};

// tslint:disable-next-line no-any
const createPackageJSON = async (pkgJSON: any) => {
  const deps = await getTransitiveDependencies('@neotracker/core', 'any');
  const peerDeps = deps.filter(([key]) => key.startsWith('@neo-one'));

  return stringify(
    {
      name: '@neotracker/core',
      version: pkgJSON.version,
      author: 'dicarlo2',
      description: pkgJSON.description,
      license: 'MIT',
      homepage: 'https://neotracker.io',
      repository: 'https://github.com/neotracker/neotracker',
      bugs: 'https://github.com/neotracker/neotracker/issues',
      keywords: ['neotracker'],
      bin: {
        neotracker: 'bin/index.js',
      },
      engines: {
        node: '>=8.9.0',
      },
      dependencies: _.fromPairs(deps.filter(([key]) => !key.startsWith('@neo-one'))),
      peerDependencies: _.fromPairs(peerDeps),
      publishConfig: {
        access: 'public',
      },
    },
    undefined,
    2,
  );
};

const run = async () => {
  setupProcessListeners({ title, exit: (exitCode) => process.exit(exitCode) });

  const dist = path.resolve(appRootDir.get(), 'dist');
  await fs.remove(path.resolve(appRootDir.get(), 'dist'));
  await fs.ensureDir(dist);

  const clientCompiler = createClientCompiler({
    dev: false,
    buildVersion: 'production',
    isCI: yargs.argv.ci,
  });
  const clientCompilerNext = createClientCompilerNext({
    dev: false,
    buildVersion: 'production',
    isCI: yargs.argv.ci,
  });
  const serverCompiler = createNodeCompiler({
    dev: false,
    bin: true,
    title: 'server',
    entryPath: path.join('packages', 'neotracker-core', 'src', 'bin', 'neotracker.ts'),
    outputPath: path.join('dist', 'neotracker-core', 'bin'),
    type: 'server-web',
    buildVersion: 'dev',
    isCI: yargs.argv.ci,
    nodeVersion: '8.9.0',
  });

  const [pkgJSON] = await Promise.all([
    fs.readJSON(path.resolve(appRootDir.get(), 'packages', 'neotracker-core', 'package.json')),
    runCompiler({ compiler: clientCompiler }),
    runCompiler({ compiler: clientCompilerNext }),
    runCompiler({ compiler: serverCompiler }),
  ]);

  const outputPath = path.resolve(appRootDir.get(), 'dist', 'neotracker-core');
  const ROOT_FILES = ['LICENSE', 'README.md'];
  const DIST_FILES = ['root', 'public'];
  const outputPKGJSON = await createPackageJSON(pkgJSON);
  await Promise.all([
    fs.writeFile(path.resolve(outputPath, 'package.json'), outputPKGJSON),
    fs.move(path.resolve(dist, 'neotracker-client-web'), path.resolve(outputPath, 'dist', 'neotracker-client-web')),
    fs.move(
      path.resolve(dist, 'neotracker-client-web-next'),
      path.resolve(outputPath, 'dist', 'neotracker-client-web-next'),
    ),
    fs.copy(
      path.resolve(appRootDir.get(), 'packages', 'neotracker-server-graphql', 'src', '__generated__', 'queries.json'),
      path.resolve(outputPath, 'dist', 'queries.json'),
    ),
    fs.copy(
      path.resolve(appRootDir.get(), 'packages', 'neotracker-server-graphql', 'src', '__generated__', 'queries'),
      path.resolve(outputPath, 'dist', 'queries'),
    ),
    Promise.all(
      ROOT_FILES.map(async (fileName) =>
        fs.copy(path.resolve(appRootDir.get(), fileName), path.resolve(outputPath, fileName)),
      ),
    ),
    Promise.all(
      DIST_FILES.map(async (fileName) =>
        fs.copy(path.resolve(appRootDir.get(), fileName), path.resolve(outputPath, 'dist', fileName)),
      ),
    ),
  ]);
};

run()
  .then(() => {
    log({ title, message: 'build successful.' });
  })
  .catch((error) => {
    logError({ title, message: 'Failed to build.', error });
    process.exit(1);
  });
