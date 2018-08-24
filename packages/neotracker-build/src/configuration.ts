import * as path from 'path';

// tslint:disable-next-line readonly-array
const getPkgPath = (pkg: string, ...paths: string[]) => path.join('dist', pkg, ...paths);

export const configuration = {
  clientBundlePath: getPkgPath('neotracker-client-web'),
  clientBundlePathNext: getPkgPath('neotracker-client-web-next'),
  clientPublicPath: '/client/',
  clientPublicPathNext: '/client-next/',
  clientAssetsPath: getPkgPath('neotracker-client-web', 'assets.json'),
  clientAssetsPathNext: getPkgPath('neotracker-client-web-next', 'assets.json'),
  statsPath: getPkgPath('neotracker-client-web-next', 'stats.json'),
  publicAssetsPath: './public',
  rootAssetsPath: './root',
};
