import fetch from 'cross-fetch';

export interface JobSummary {}

export type VCS = 'github' | 'bitbucket';

export class CircleCI {
  private mutableToken: string | undefined;

  public authenticate(token: string) {
    this.mutableToken = token;
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
    const token = this.getToken();

    const response = await fetch(
      `https://circleci.com/api/v1.1/project/${vcs}/${username}/${project}/${jobNumber}/retry?circle-token=${token}`,
      {
        method: 'POST',
      },
    );

    if (response.status !== 200) {
      throw new Error(`Failed to retry job: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private getToken(): string {
    if (this.mutableToken === undefined) {
      throw new Error(`CircleCI API has not been authenticated.`);
    }

    return this.mutableToken;
  }
}
