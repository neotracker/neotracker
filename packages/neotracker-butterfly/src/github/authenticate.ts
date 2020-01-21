import Github from '@octokit/rest';
import * as jwt from 'jsonwebtoken';

export interface AuthenticateOptions {
  readonly appID: number;
  readonly privateKey: string;
  readonly installationID?: number;
  readonly project?: {
    readonly owner: string;
    readonly repo: string;
  };
}

export const authenticate = async ({
  api,
  options: { appID, privateKey, installationID: installationIDIn, project },
}: {
  readonly options: AuthenticateOptions;
  readonly api: Github;
}): Promise<void> => {
  const nowSeconds = Math.round(Date.now() / 1000);
  const payload = {
    iat: nowSeconds,
    exp: nowSeconds + 9 * 60,
    iss: appID,
  };
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  api.authenticate({ type: 'app', token });

  let installationID = installationIDIn;
  if (installationID === undefined && project !== undefined) {
    const response = await api.apps.findRepoInstallation({
      owner: project.owner,
      repo: project.repo,
    });
    installationID = response.data.id;
  }

  if (installationID !== undefined) {
    const installationTokenResponse = await api.apps.createInstallationToken({
      installation_id: installationID,
    });

    api.authenticate({ type: 'app', token: installationTokenResponse.data.token });
  }
};
