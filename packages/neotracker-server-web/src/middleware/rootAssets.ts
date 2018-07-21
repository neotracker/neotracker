// @ts-ignore
import { routes } from '@neotracker/shared-web';
import { Options, serveAssets } from './serveAssets';

export const rootAssets = ({ options }: { readonly options: Options }) =>
  serveAssets({
    name: 'rootAssets',
    route: routes.ROOT,
    options,
  });
