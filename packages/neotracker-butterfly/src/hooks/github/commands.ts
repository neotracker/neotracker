// tslint:disable no-console
// tslint:disable-next-line no-implicit-dependencies
import { IssueComment, Issues, PullRequest } from 'github-webhook-event-types';
import _ from 'lodash';
import { ButterflyWebhook, GithubEvent } from '../../types';
import { LABEL_NAME } from './mergeOnGreen';

export interface CommandsOptions {
  readonly test: {
    readonly circleCIContexts: ReadonlyArray<string>;
  };
}

type Data = IssueComment | PullRequest | Issues;

interface Label {
  readonly id: number;
  readonly url: string;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly default: boolean;
}

class Command {
  public constructor(
    private readonly name: string,
    private readonly callback: (butterfly: ButterflyWebhook, args: string, data: Data) => Promise<void>,
  ) {}

  public async execute(butterfly: ButterflyWebhook, data: Data, body: string): Promise<void> {
    const args = body.match(this.matcher);
    if (args !== null) {
      await this.callback(butterfly, args[1].trim(), data);
    }
  }

  private get matcher(): RegExp {
    return new RegExp(`^\\/${this.name}(.*)$`);
  }
}

// tslint:disable-next-line no-any
const isIssueComment = (data: any): data is IssueComment => data.comment !== undefined;

// tslint:disable-next-line no-any
const isPullRequest = (data: any): data is PullRequest => data.pull_request !== undefined;

export const commands = (options: CommandsOptions) => {
  const COMMANDS: ReadonlyArray<Command> = [
    new Command('test', async (butterfly, args, data) => {
      if (isIssueComment(data)) {
        const contexts = new Set(options.test.circleCIContexts);

        const statuses = await butterfly.github.utils.getStatusesForPullRequest({
          filterStatus: (status) => contexts.has(status.context),
          issueNumber: data.issue.number,
          owner: data.repository.owner.login,
          repo: data.repository.name,
        });

        const statusesReversed = _.reverse(statuses);
        const argContexts = args.split(' ').filter((argContext) => argContext !== '');

        const contextLastStatuses = options.test.circleCIContexts
          .filter((context) => {
            if (args.length === 0) {
              return true;
            }

            return argContexts.some((argContext) => context.endsWith(argContext));
          })
          .map((context) => {
            const status = statusesReversed.find((stat) => stat.context === context);

            return { status, context };
          });

        await Promise.all(
          contextLastStatuses.map(async ({ status, context }) => {
            if (status === undefined) {
              throw new Error(`Could not find circleci status for ${context}`);
            }
            const targetURLParts = butterfly.circleci.utils.extractGithubTargetURLParts(status.target_url);

            await butterfly.circleci.api.retryJob(targetURLParts);
          }),
        );
      }
    }),
    new Command('merge-on-green', async (butterfly, _args, data) => {
      if (isIssueComment(data)) {
        const issue = data.issue;
        const comment = data.comment;
        const api = butterfly.github.api;

        // Only look at PR issue comments, this isn't in the type system
        // tslint:disable-next-line no-any
        if (!(issue as any).pull_request) {
          return;
        }

        // Check to see if the label has already been set
        if (issue.labels.find((l) => l.name === LABEL_NAME)) {
          return;
        }

        const sender = comment.user;
        const username = sender.login;
        const org = data.repository.owner.login;

        try {
          await api.orgs.checkMembership({ org, username });
        } catch {
          throw new Error(`Sender ${username} does not have permission to merge in "${org}"`);
        }

        // Create or re-use an existing label
        const owner = org;
        const repo = data.repository.name;
        const existingLabels = await api.issues.listLabelsForRepo({ owner, repo });
        const mergeOnGreen = existingLabels.data.find((l: Label) => l.name === LABEL_NAME);

        // Create the label if it doesn't exist yet
        if (!mergeOnGreen) {
          await api.issues.createLabel({
            owner,
            repo,
            name: LABEL_NAME,
            color: '247A38',
            description: 'A label to indicate that Butterfly should merge this PR when all statuses are green',
          });
        }

        // Then add the label
        // tslint:disable-next-line no-any
        await api.issues.addLabels({ owner, repo, number: issue.number, labels: [LABEL_NAME] } as any);
      }
    }),
  ];

  return async (butterfly: ButterflyWebhook, { payload }: GithubEvent<Data>): Promise<void> => {
    let body: string;
    if (isIssueComment(payload)) {
      body = payload.comment.body;
    } else if (isPullRequest(payload)) {
      body = payload.pull_request.body;
    } else {
      body = payload.issue.body;
    }

    await Promise.all(COMMANDS.map(async (command) => command.execute(butterfly, payload, body)));
  };
};
