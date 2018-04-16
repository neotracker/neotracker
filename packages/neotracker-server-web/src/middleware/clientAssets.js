/* @flow */
import { routes } from 'neotracker-shared-web';

import serveAssets, { type Options } from './serveAssets';

export default ({ options }: {| options: Options |}) =>
  serveAssets({
    name: 'clientAssets',
    route: routes.CLIENT,
    options,
  });
