import { ButterflyOptions, createButterfly } from './createButterfly';
import { hooks, HooksOptions } from './hooks';
import { Butterfly, GithubEvent } from './types';

// tslint:disable-next-line no-any
export type Hook = (butterfly: Butterfly, event: GithubEvent) => Promise<void>;
export interface Hooks {
  readonly [name: string]: ReadonlyArray<Hook> | undefined;
}

export interface ButterflyHandlerOptions {
  readonly butterfly: ButterflyOptions;
  readonly hooks: HooksOptions;
}

const notNull = <T>(value: T | undefined | null): value is T => value != undefined;

export class ButterflyHandler {
  private readonly butterfly: Butterfly;
  private readonly hooks: ReturnType<typeof hooks>;

  public constructor({ butterfly, hooks: hooksOptions }: ButterflyHandlerOptions) {
    this.butterfly = createButterfly(butterfly);
    this.hooks = hooks(hooksOptions);
  }

  // tslint:disable-next-line no-any
  public async handleGithubWebhook(event: string, payload: any): Promise<ReadonlyArray<Error>> {
    const eventHandlers = this.hooks.github[event];
    const eventActionsHandlers = payload.action === undefined ? [] : this.hooks.github[`${event}.${payload.action}`];
    const handlers = (eventHandlers === undefined ? [] : eventHandlers).concat(
      eventActionsHandlers === undefined ? [] : eventActionsHandlers,
    );

    const errors = await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(this.butterfly, { name: event, payload });

          return undefined;
        } catch (error) {
          return error as Error;
        }
      }),
    );

    return errors.filter(notNull);
  }
}
