import yargs from 'yargs';
import { BuildRunner, ServerRunner } from '../runner';

const { argv } = yargs
  .describe('build', 'Build a static version of the component explorer')
  .default('build', false)
  .string('out')
  .describe('out', 'Output directory for static build')
  .string('public-path')
  .describe('public-path', 'Path the static build will be served from')
  .string('router')
  .describe('router', 'Uses Memory Router in place of Browser Router')
  .choices('router', ['browser', 'memory'])
  .default('router', 'browser')
  .describe('ci', 'Build for continuous integration')
  .default('ci', false);

const { router } = argv;
if (router !== 'browser' && router !== 'memory') {
  throw new Error(`invalid router: ${router}`);
}

if (argv.build) {
  new BuildRunner({
    isCI: argv.ci,
    staticOptions: {
      outDir: argv.out,
      publicPath: argv['public-path'],
      router,
    },
  }).execute();
} else {
  new ServerRunner({ isCI: argv.ci }).execute();
}
