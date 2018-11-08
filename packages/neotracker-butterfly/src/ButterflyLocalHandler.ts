import { Check, CheckAnnotation } from './ButterflyCIHandler';
import { ButterflyOptions, createButterfly } from './createButterfly';
import { Butterfly } from './types';

export interface ButterflyLocalHandlerOptions extends ButterflyOptions {
  readonly checks: ReadonlyArray<Check>;
}

export class ButterflyLocalHandler {
  private readonly butterfly: ButterflyOptions;
  private readonly checks: ReadonlyArray<Check>;
  public constructor({ checks, ...rest }: ButterflyLocalHandlerOptions) {
    this.butterfly = rest;
    this.checks = checks;
  }

  public preRunAll() {
    // do nothing
  }

  public async run(name: string): Promise<0 | 1> {
    const check = this.checks.find(({ name: checkName }) => checkName === name);
    if (check === undefined) {
      throw new Error(`Could not find check with name ${name}`);
    }

    const butterfly = await this.getButterfly();

    try {
      const result = await check.run(butterfly);
      butterfly.log.info(`Check ${name} conclusion: ${result.conclusion}
          title: ${result.title}
          summary: ${result.summary}
          text: ${result.details}
          annotations: ${this.convertCheckAnnotations(result.annotations)}`);

      return result.conclusion === 'failure' ? 1 : 0;
    } catch (error) {
      butterfly.log.info(`Unexpected error ocurred while running: ${name} failed\n${error.stack}`);

      return 1;
    }
  }

  private async getButterfly(): Promise<Butterfly> {
    return createButterfly(this.butterfly);
  }

  private convertCheckAnnotations(annotations: ReadonlyArray<CheckAnnotation> = []): string {
    return annotations.map((item) => this.convertCheckAnnotation(item)).join('\n');
  }

  private convertCheckAnnotation({
    fileName,
    startLine,
    endLine,
    warningLevel,
    message,
    title,
    rawDetails,
  }: CheckAnnotation): string {
    return `
      filename: ${fileName},
      start_line: ${startLine},
      end_line: ${endLine},
      warning_level: ${warningLevel},
      message: ${message},
      title: ${title},
      raw_details: ${rawDetails}`;
  }
}
