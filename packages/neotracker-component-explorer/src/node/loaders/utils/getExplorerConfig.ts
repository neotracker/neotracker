import webpack from 'webpack';
import { ExplorerConfig } from '../../../types';

export const getExplorerConfig = (loader: webpack.loader.LoaderContext): ExplorerConfig =>
  // tslint:disable-next-line no-any
  (loader as any)._explorer;
