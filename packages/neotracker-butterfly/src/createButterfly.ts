import { circleci } from './circleci';
import { github } from './github';
import { Butterfly } from './types';

export interface ButterflyOptions {
  readonly circleci: {
    readonly token: string;
  };
  readonly github: {
    readonly appID: string;
    readonly privateKey: string;
  };
}

export const createButterfly = ({
  circleci: { token },
  github: { appID, privateKey },
}: ButterflyOptions): Butterfly => {
  const butterfly = {
    circleci,
    github,
  };

  butterfly.circleci.authenticate(token);
  butterfly.github.authenticate({
    appID,
    privateKey,
  });

  return butterfly;
};
