/* @flow */
import './init';
import createScraper$ from './createScraper$';

export default createScraper$;

export type {
  Environment as ScrapeEnvironment,
  Options as ScrapeOptions,
} from './createScraper$';
