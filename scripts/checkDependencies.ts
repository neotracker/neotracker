import * as appRootDir from 'app-root-dir';
import execa from 'execa';
import * as fs from 'fs-extra';
import * as path from 'path';

const log = (value: string | Error) => {
  if (value instanceof Error) {
    // tslint:disable-next-line no-console
    console.error(value);
  } else {
    // tslint:disable-next-line no-console
    console.log(value);
  }
};

const dir = path.resolve(appRootDir.get(), 'packages');

const checkDependency = async (pkg: string, dependency: string) => {
  try {
    await execa('ack', [`'${dependency}.*'`, path.resolve(dir, pkg, 'src')]);
  } catch {
    log(`${pkg}: ${dependency}`);
  }
};

const checkPackage = async (pkg: string) => {
  const pkgJSON = await fs.readFile(path.resolve(dir, pkg, 'package.json'), 'utf8');

  const dependencies = JSON.parse(pkgJSON).dependencies;
  if (dependencies !== undefined) {
    await Promise.all(Object.keys(dependencies).map(async (dependency) => checkDependency(pkg, dependency)));
  }
};

const run = async () => {
  log('Checking dependencies...');
  const packages = await fs.readdir(dir);

  await Promise.all(packages.filter((pkg) => pkg.startsWith('neotracker')).map(checkPackage));
};

run()
  .then(() => {
    log('Done');
    process.exit(0);
  })
  .catch((error) => {
    log(error);
    process.exit(1);
  });
