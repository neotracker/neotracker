import * as path from 'path';
import { createNodeCompiler } from './createNodeCompiler';

export const createServerCompiler = ({ isCI }: { readonly isCI: boolean }) =>
  createNodeCompiler({
    title: 'server',
    entryPath: path.join('packages', 'neotracker-build', 'src', 'entry', 'server.ts'),
    outputPath: path.join('dist', 'neotracker-server-web'),
    type: 'server-web',
    buildVersion: 'dev',
    isCI,
    dev: true,
  });
