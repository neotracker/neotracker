// @ts-ignore
import { routes } from '@neotracker/shared-web';
import { Options, serveAssets } from './serveAssets';

export const publicAssets = ({ options }: { readonly options: Options }) =>
  serveAssets({
    name: 'publicAssets',
    route: routes.PUBLIC,
    options,
  });
