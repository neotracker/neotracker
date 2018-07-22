import Github from '@octokit/rest';

export const utils = (api: Github) => ({
  getStatusesForPullRequest: async ({
    filterStatus,
    issueNumber,
    owner,
    repo,
  }: {
    // tslint:disable-next-line no-any
    filterStatus: (status: any) => boolean;
    issueNumber: number;
    owner: string;
    repo: string;
    // tslint:disable-next-line:no-any
  }): Promise<ReadonlyArray<any>> => {
    const commitsResponse = await api.pullRequests.getCommits({
      number: issueNumber,
      owner,
      repo,
    });
    if (commitsResponse.status === 200) {
      const commit = commitsResponse.data[commitsResponse.data.length - 1];
      const statusesResponse = await api.repos.getStatuses({
        ref: commit.tree.sha,
        owner,
        repo,
      });
      if (statusesResponse.status === 200) {
        // tslint:disable-next-line no-any no-unnecessary-callback-wrapper
        return statusesResponse.data.filter((status: any) => filterStatus(status));
      }

      throw new Error(`Could not fetch commit statuses: ${statusesResponse.status}`);
    }

    throw new Error(`Could not fetch pull request commits: ${commitsResponse.status}`);
  },
});
