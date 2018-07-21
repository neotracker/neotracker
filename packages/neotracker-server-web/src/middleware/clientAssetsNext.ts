import { routes } from '@neotracker/shared-web-next';
import { Options, serveAssets } from './serveAssets';

export const clientAssetsNext = ({ options }: { readonly options: Options }) =>
  serveAssets({
    name: 'clientAssets',
    route: routes.CLIENT,
    options,
  });
