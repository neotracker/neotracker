import fetch from 'cross-fetch';

export interface CircleCIOptions {
  readonly token: string;
}

export interface JobSummary {}

export type VCS = 'github' | 'bitbucket';

export class CircleCI {
  private readonly token: string;

  public constructor({ token }: CircleCIOptions) {
    this.token = token;
  }

  // /project/:vcs-type/:username/:project/:build_num/retry
  public async retryJob({
    vcs,
    username,
    project,
    jobNumber,
  }: {
    readonly vcs: VCS;
    readonly username: string;
    readonly project: string;
    readonly jobNumber: number;
  }): Promise<JobSummary> {
    const response = await fetch(
      `https://circleci.com/api/v1.1/project/${vcs}/${username}/${project}/${jobNumber}/retry?circle-token=${this.token}`,
      {
        method: 'POST',
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to retry job: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
