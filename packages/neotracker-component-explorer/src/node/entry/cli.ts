import yargs from 'yargs';
import { BuildRunner, ServerRunner } from '../runner';

yargs.describe('build', 'Build a static version of the component explorer').default('build', false);
yargs.describe('out', 'Output directory for static build');
yargs.describe('public-path', 'Path the static build will be served from');
yargs.describe('router', 'Uses Memory Router in place of Browser Router').default('router', 'browser');
yargs.describe('ci', 'Build for continuous integration').default('ci', false);

if (yargs.argv.build) {
  new BuildRunner({
    isCI: yargs.argv.ci,
    staticOptions: {
      outDir: yargs.argv.out,
      publicPath: yargs.argv['public-path'],
      router: yargs.argv.router,
    },
  }).execute();
} else {
  new ServerRunner({ isCI: yargs.argv.ci }).execute();
}
