import { api } from './api';

export const authenticate = ({ key, secret }: { readonly key: string; readonly secret: string }) => {
  api.authenticate({ type: 'oauth', key, secret });
};
