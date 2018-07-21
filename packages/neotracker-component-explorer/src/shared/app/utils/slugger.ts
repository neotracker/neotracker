// @ts-ignore
import GithubSlugger from 'github-slugger';

interface Slugger {
  readonly slug: (name: string) => string;
  readonly reset: () => void;
}

export const slugger: Slugger = new GithubSlugger();
