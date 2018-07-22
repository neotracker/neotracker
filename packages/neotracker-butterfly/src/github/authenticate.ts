import * as jwt from 'jsonwebtoken';
import { api } from './api';

export const authenticate = ({ appID, privateKey }: { readonly appID: string; readonly privateKey: string }) => {
  const nowSeconds = Math.round(Date.now() / 1000);
  const payload = {
    iat: nowSeconds,
    exp: nowSeconds + 10 * 60,
    iss: appID,
  };
  const token = jwt.sign(payload, privateKey);
  api.authenticate({ type: 'app', token });
};
