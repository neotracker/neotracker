// @ts-ignore
import { routes } from '@neotracker/shared-web';
import { Options, serveAssets } from './serveAssets';

export const clientAssets = ({ options }: { readonly options: Options }) =>
  serveAssets({
    name: 'clientAssets',
    route: routes.CLIENT,
    options,
  });
