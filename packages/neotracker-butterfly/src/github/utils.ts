import _ from 'lodash';
import { api } from './api';

const findLastStatus = async ({
  isStatus,
  issueNumber,
  owner,
  repo,
}: {
  // tslint:disable-next-line no-any
  readonly isStatus: (status: any) => boolean;
  readonly issueNumber: number;
  readonly owner: string;
  readonly repo: string;
  // tslint:disable-next-line no-any
}): Promise<any> => {
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
      return _.reverse(statusesResponse.data).find((status: any) => isStatus(status));
    }

    throw new Error(`Could not fetch commit statuses: ${statusesResponse.status}`);
  }

  throw new Error(`Could not fetch pull request commits: ${commitsResponse.status}`);
};

export const utils = {
  findLastStatus,
};
