import { api } from './api';

export const authenticate = (token: string) => api.authenticate(token);
