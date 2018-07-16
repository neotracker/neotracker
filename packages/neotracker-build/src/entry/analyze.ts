import { createClientCompiler, createClientCompilerNext, runCompiler } from '../compiler';
import { log } from '../log';
import { logError } from '../logError';
import { setupProcessListeners } from '../setupProcessListeners';

const title = 'analyze';

const run = async () => {
  setupProcessListeners({ title, exit: (exitCode) => process.exit(exitCode) });

  const clientCompiler = createClientCompiler({
    dev: false,
    analyze: true,
    buildVersion: 'production',
  });
  const clientCompilerNext = createClientCompilerNext({
    dev: false,
    analyze: true,
    buildVersion: 'production',
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
