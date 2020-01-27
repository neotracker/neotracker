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
    const commitsResponse = await api.pullRequests.listCommits({
      number: issueNumber,
      owner,
      repo,
    });
    const commit = commitsResponse.data[commitsResponse.data.length - 1];
    if ((commit.sha as string | undefined) === undefined) {
      return [];
    }

    const statusesResponse = await api.repos.listStatusesForRef({
      ref: commit.sha,
      owner,
      repo,
    });

    // tslint:disable-next-line no-any no-unnecessary-callback-wrapper
    return statusesResponse.data.filter((status: any) => filterStatus(status));
  },
});
