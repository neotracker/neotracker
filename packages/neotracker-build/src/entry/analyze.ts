import yargs from 'yargs';
import { createClientCompiler, createClientCompilerNext, runCompiler } from '../compiler';
import { log } from '../log';
import { logError } from '../logError';
import { setupProcessListeners } from '../setupProcessListeners';

const title = 'analyze';
const { argv } = yargs.describe('ci', 'Running as part of continuous integration').default('ci', false);

const run = async () => {
  setupProcessListeners({ title, exit: (exitCode) => process.exit(exitCode) });

  const clientCompiler = createClientCompiler({
    dev: false,
    analyze: true,
    buildVersion: 'production',
    isCI: argv.ci,
  });
  const clientCompilerNext = createClientCompilerNext({
    dev: false,
    analyze: true,
    buildVersion: 'production',
    isCI: argv.ci,
  });

  await Promise.all([runCompiler({ compiler: clientCompiler }), runCompiler({ compiler: clientCompilerNext })]);
};

run()
  .then(() => {
    log({ title, message: 'Analyze successful.' });
  })
  .catch((error) => {
    logError({ title, message: 'Failed to analyze bundle size.', error });
    process.exit(1);
  });
