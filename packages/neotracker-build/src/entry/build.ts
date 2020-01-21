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
const { argv } = yargs.describe('ci', 'Running as part of continuous integration').default('ci', false);

const NEOTRACKER = '@neotracker/';
const getTransitiveDependencies = async (
  pkgName: string,
  version: string,
  // tslint:disable-next-line: readonly-array
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

const createBin = () => `#!/usr/bin/env node
const execa = require('execa');
const path = require('path');
const semver = require('semver');

let args = [];
if (semver.satisfies(process.version, '8.x')) {
  args = ['--harmony-async-iteration'];
} else if (semver.satisfies(process.version, '9.x')) {
  args = ['--harmony'];
}

const proc = execa('node', args.concat([path.resolve(__dirname, 'index.js')]).concat(process.argv.slice(2)), {
  stdio: 'inherit',
  env: {
    NODE_NO_WARNINGS: '1',
  },
});
process.on('SIGTERM', () => proc.cancel('SIGTERM'));
process.on('SIGINT', () => proc.cancel('SIGINT'));
process.on('SIGBREAK', () => proc.cancel('SIGBREAK'));
process.on('SIGHUP', () => proc.cancel('SIGHUP'));
proc.on('exit', (code, signal) => {
  let exitCode = code;
  if (exitCode === null) {
    exitCode = signal === 'SIGINT' ? 0 : 1;
  }
  process.exit(exitCode);
});
`;

// tslint:disable-next-line no-any
const createPackageJSON = async (pkgJSON: any) => {
  const deps = await getTransitiveDependencies('@neotracker/core', 'any');

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
        neotracker: 'bin/neotracker',
        'neotracker.js': 'bin/index.js',
      },
      engines: {
        node: '>=8.9.0',
      },
      dependencies: _.fromPairs(deps.filter(([key]) => !key.startsWith('@types'))),
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
    isCI: argv.ci,
  });
  const clientCompilerNext = createClientCompilerNext({
    dev: false,
    buildVersion: 'production',
    isCI: argv.ci,
  });
  const serverCompiler = createNodeCompiler({
    dev: false,
    bin: true,
    title: 'server',
    entryPath: path.join('packages', 'neotracker-core', 'src', 'bin', 'neotracker.ts'),
    outputPath: path.join('dist', 'neotracker-core', 'bin'),
    type: 'server-web',
    buildVersion: 'dev',
    isCI: argv.ci,
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
    fs.writeFile(path.resolve(outputPath, 'bin', 'neotracker'), createBin()),
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
