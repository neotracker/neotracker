import Github from '@octokit/rest';
import * as jwt from 'jsonwebtoken';

export interface AuthenticateOptions {
  readonly appID: number;
  readonly privateKey: string;
  readonly installationID?: number;
}

export const authenticate = async ({
  api,
  options: { appID, privateKey, installationID },
}: {
  readonly options: AuthenticateOptions;
  readonly api: Github;
}): Promise<void> => {
  const nowSeconds = Math.round(Date.now() / 1000);
  const payload = {
    iat: nowSeconds,
    exp: nowSeconds + 10 * 60,
    iss: appID,
  };
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  api.authenticate({ type: 'app', token });

  if (installationID !== undefined) {
    const installationTokenResponse = await api.apps.createInstallationToken({
      installation_id: `${installationID}`,
    });
    if (installationTokenResponse.status !== 200) {
      throw new Error(`Failed to fetch installation token for ${installationID}: ${installationTokenResponse.status}`);
    }

    api.authenticate({ type: 'app', token: installationTokenResponse.data.token });
  }
};
