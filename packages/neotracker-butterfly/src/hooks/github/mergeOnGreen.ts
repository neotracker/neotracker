import { Label, Status } from 'github-webhook-event-types';
import { ButterflyWebhook, GithubEvent } from '../../types';

export const LABEL_NAME = 'merge-on-green';

export const mergeOnGreen = async (
  butterfly: ButterflyWebhook,
  { payload: status }: GithubEvent<Status>,
): Promise<void> => {
  const api = butterfly.github.api;

  if (status.state !== 'success') {
    butterfly.log.verbose(`Not a successful state: ${status.state}`);

    return;
  }

  const owner = status.repository.owner.login;
  const repo = status.repository.name;
  const allGreen = await api.repos.getCombinedStatusForRef({ owner, repo, ref: status.commit.sha });
  if (allGreen.data.state !== 'success') {
    butterfly.log.verbose('Not all statuses are green');

    return;
  }

  // See https://github.com/maintainers/early-access-feedback/issues/114 for more context on getting a PR from a SHA
  const repoString = status.repository.full_name;
  const searchResponse = await api.search.issues({ q: `${status.commit.sha} type:pr is:open repo:${repoString}` });

  // https://developer.github.com/v3/search/#search-issues
  // tslint:disable-next-line no-any
  const prsWithCommit: ReadonlyArray<number> = searchResponse.data.items.map((i: any) => i.number);
  const prsSet = [...new Set(prsWithCommit)];
  await Promise.all(
    prsSet.map(async (issueNumber) => {
      const issue = await api.issues.get({ owner, repo, number: issueNumber });

      // tslint:disable-next-line no-any
      const labels = (issue.data.labels as any) === undefined ? [] : issue.data.labels;

      const mergeLabel = labels.find((l: Label['label']) => l.name === LABEL_NAME);
      if (!mergeLabel) {
        butterfly.log.verbose('PR does not have Merge on Green');

        return;
      }

      await api.pullRequests.merge({
        owner,
        repo,
        number: issueNumber,
        commit_title: issue.data.title,
        merge_method: 'squash',
      });

      butterfly.log.verbose(`Merged PR ${issueNumber}`);
    }),
  );
};
