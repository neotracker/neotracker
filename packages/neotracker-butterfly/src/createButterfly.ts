import { circleci } from './circleci';
import { github } from './github';
import { Butterfly } from './types';

export interface ButterflyOptions {
  readonly circleci: {
    readonly token: string;
  };
  readonly github: {
    readonly key: string;
    readonly secret: string;
  };
}

export const createButterfly = ({ circleci: { token }, github: { key, secret } }: ButterflyOptions): Butterfly => {
  const butterfly = {
    circleci,
    github,
  };

  butterfly.circleci.authenticate(token);
  butterfly.github.authenticate({
    key,
    secret,
  });

  return butterfly;
};
