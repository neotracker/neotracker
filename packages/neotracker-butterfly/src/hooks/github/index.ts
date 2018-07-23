import { Hooks } from '../../ButterflyHandler';
import { commands, CommandsOptions } from './commands';
import { mergeOnGreen } from './mergeOnGreen';

export interface GithubOptions {
  readonly commands: CommandsOptions;
}

// tslint:disable-next-line:export-name
export const github = (options: GithubOptions): Hooks => ({
  'issue_comment.created': [commands(options.commands)],
  'pull_request.opened': [commands(options.commands)],
  'issues.opened': [commands(options.commands)],
  'status.success': [mergeOnGreen],
});
