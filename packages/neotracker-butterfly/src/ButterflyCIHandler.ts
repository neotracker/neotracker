import Github from '@octokit/rest';
import { ButterflyCIOptions, createButterflyCI } from './createButterflyCI';
import { ButterflyCI } from './types';

export interface CheckAnnotation {
  readonly fileName: string;
  readonly startLine: number;
  readonly endLine: number;
  readonly warningLevel: 'notice' | 'warning' | 'failure';
  readonly message: string;
  readonly title: string;
  readonly rawDetails?: string;
}
export interface CheckResult {
  readonly title: string;
  readonly summary: string;
  readonly details?: string;
  readonly conclusion: 'failure' | 'success' | 'neutral';
  readonly annotations?: ReadonlyArray<CheckAnnotation>;
}
export interface Check {
  readonly run: (butterfly: ButterflyCI) => Promise<CheckResult>;
  readonly name: string;
}

export interface CommitOptions {
  readonly branch: string;
  readonly sha: string;
}

export interface ButterflyCIHandlerOptions extends ButterflyCIOptions {
  readonly checks: ReadonlyArray<Check>;
  readonly commit: CommitOptions;
}

interface CheckRun {
  readonly id: number;
}

export class ButterflyCIHandler {
  private readonly butterfly: ButterflyCIOptions;
  private readonly checks: ReadonlyArray<Check>;
  private readonly commit: CommitOptions;

  public constructor({ checks, commit, ...rest }: ButterflyCIHandlerOptions) {
    this.butterfly = rest;
    this.checks = checks;
    this.commit = commit;
  }

  public async preRunAll(): Promise<void> {
    const butterfly = await this.getButterfly();

    await Promise.all(
      this.checks.map(async ({ name }) => {
        await butterfly.github.api.checks.create({
          name,
          head_sha: this.sha,
          head_branch: this.branch,
          owner: this.owner,
          repo: this.repo,
          status: 'queued',
        });
      }),
    );
  }

  public async run(name: string): Promise<void> {
    const check = this.checks.find(({ name: checkName }) => checkName === name);
    if (check === undefined) {
      throw new Error(`Could not find check with name ${name}`);
    }

    const butterfly = await this.getButterfly();

    await this.updateCheckRun(butterfly, name, { status: 'in_progress' });

    try {
      const result = await check.run(butterfly);
      await this.updateCheckRun(butterfly, name, {
        status: 'completed',
        conclusion: result.conclusion,
        output: {
          title: result.title,
          summary: result.summary,
          text: result.details,
          annotations: this.convertCheckAnnotations(result.annotations),
        },
      });
    } catch (error) {
      await this.updateCheckRun(butterfly, name, {
        status: 'completed',
        conclusion: 'failure',
        output: {
          title: 'Failure',
          summary: 'Unexpected error occurred while running check.',
          text: `
Error was thrown while running the check.
\`\`\`
${error.stack}
\`\`\`
`.trim(),
        },
      });
    }
  }

  private async updateCheckRun(
    butterfly: ButterflyCI,
    name: string,
    update: Partial<Github.ChecksUpdateParams>,
  ): Promise<void> {
    const checkRun = await this.getCheckRun(butterfly, name);

    await butterfly.github.api.checks.update({
      ...update,
      check_run_id: `${checkRun.id}`,
      name,
      owner: this.owner,
      repo: this.repo,
    });
  }

  private async getCheckRun(butterfly: ButterflyCI, name: string): Promise<CheckRun> {
    const checkRunResponse = await butterfly.github.api.checks.listForRef({
      owner: this.owner,
      repo: this.repo,
      ref: this.sha,
      check_name: name,
    });

    const checkRun = checkRunResponse.data.check_runs[checkRunResponse.data.check_runs.length - 1];
    if (checkRun === undefined) {
      throw new Error(`Could not find existing check run for ${name}`);
    }

    return checkRun;
  }

  private get owner(): string {
    return this.butterfly.pullRequest.owner;
  }

  private get repo(): string {
    return this.butterfly.pullRequest.repo;
  }

  private get sha(): string {
    return this.commit.sha;
  }

  private get branch(): string {
    return this.commit.branch;
  }

  private async getButterfly(): Promise<ButterflyCI> {
    return createButterflyCI({
      ...this.butterfly,
      github: {
        ...this.butterfly.github,
        authenticate: {
          ...this.butterfly.github.authenticate,
          project: {
            owner: this.owner,
            repo: this.repo,
          },
        },
      },
    });
  }

  private convertCheckAnnotations(
    annotations: ReadonlyArray<CheckAnnotation> = [],
    // tslint:disable-next-line readonly-array
  ): Github.ChecksUpdateParamsOutputAnnotations[] {
    return annotations.map(this.convertCheckAnnotation);
  }

  private convertCheckAnnotation({
    fileName,
    startLine,
    endLine,
    warningLevel,
    message,
    title,
    rawDetails,
  }: CheckAnnotation): Github.ChecksUpdateParamsOutputAnnotations {
    return {
      filename: fileName,
      blob_href: `https://github.com/${this.owner}/${this.repo}/blob/${this.sha}/${fileName}`,
      start_line: startLine,
      end_line: endLine,
      warning_level: warningLevel,
      message,
      title,
      raw_details: rawDetails,
    };
  }
}
