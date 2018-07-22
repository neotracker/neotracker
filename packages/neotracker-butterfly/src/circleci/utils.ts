import { URL } from 'url';
import { CircleCI, VCS } from './CircleCI';

interface TargetURLParts {
  readonly vcs: VCS;
  readonly username: string;
  readonly project: string;
  readonly jobNumber: number;
}

const extractGithubTargetURLParts = (urlString: string): TargetURLParts => {
  const url = new URL(urlString);
  const [vcs, username, project, jobNumber] = url.pathname.slice(1).split('/');

  return {
    vcs: vcs === 'gh' ? 'github' : 'bitbucket',
    username,
    project,
    jobNumber: parseInt(jobNumber, 10),
  };
};

export const utils = (_api: CircleCI) => ({
  extractGithubTargetURLParts,
});
