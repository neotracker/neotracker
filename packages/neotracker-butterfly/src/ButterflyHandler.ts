import { ButterflyOptions as AllButterflyOptions, createButterfly } from './createButterfly';
import { GithubOptions } from './github';
import { hooks, HooksOptions } from './hooks';
import { Butterfly, GithubEvent } from './types';

// tslint:disable-next-line no-any
export type Hook = (butterfly: Butterfly, event: GithubEvent) => Promise<void>;
export interface Hooks {
  readonly [name: string]: ReadonlyArray<Hook> | undefined;
}

export type ButterflyOptions = Omit<AllButterflyOptions, 'github'> & {
  readonly github: Omit<GithubOptions, 'authenticate'> & {
    readonly authenticate: Omit<GithubOptions['authenticate'], 'owner' | 'repo'>;
  };
};

export interface ButterflyHandlerOptions {
  readonly butterfly: ButterflyOptions;
  readonly hooks: HooksOptions;
}

const notNull = <T>(value: T | undefined | null): value is T => value != undefined;

// tslint:disable-next-line no-any
const getInstallationID = (payload: any): number | undefined => {
  if (
    typeof payload === 'object' &&
    typeof payload.installation === 'object' &&
    typeof payload.installation.id === 'number'
  ) {
    return payload.installation.id;
  }

  return undefined;
};

export class ButterflyHandler {
  private readonly butterfly: ButterflyOptions;
  private readonly hooks: ReturnType<typeof hooks>;

  public constructor({ butterfly, hooks: hooksOptions }: ButterflyHandlerOptions) {
    this.butterfly = butterfly;
    this.hooks = hooks(hooksOptions);
  }

  // tslint:disable-next-line no-any
  public async handleGithubWebhook(event: string, payload: any): Promise<ReadonlyArray<Error>> {
    const eventHandlers = this.hooks.github[event];
    const eventActionsHandlers = payload.action === undefined ? [] : this.hooks.github[`${event}.${payload.action}`];
    const eventStateHandlers = payload.state === undefined ? [] : this.hooks.github[`${event}.${payload.state}`];
    const handlers = (eventHandlers === undefined ? [] : eventHandlers)
      .concat(eventActionsHandlers === undefined ? [] : eventActionsHandlers)
      .concat(eventStateHandlers === undefined ? [] : eventStateHandlers);

    if (handlers.length === 0) {
      return [];
    }

    const butterfly = await createButterfly({
      ...this.butterfly,
      github: {
        ...this.butterfly.github,
        authenticate: {
          ...this.butterfly.github.authenticate,
          installationID: getInstallationID(payload),
        },
      },
    });

    const errors = await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(butterfly, { name: event, payload });

          return undefined;
        } catch (error) {
          return error as Error;
        }
      }),
    );

    return errors.filter(notNull);
  }
}
