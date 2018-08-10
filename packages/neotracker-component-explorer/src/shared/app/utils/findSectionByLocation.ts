import { RouteComponentProps } from 'react-router';
import { SectionConfig } from '../../../types';

export const findSectionByLocation = (
  sections: ReadonlyArray<SectionConfig>,
  // tslint:disable-next-line no-any
  location: RouteComponentProps<any>['location'],
) => {
  const slugs = location.pathname.split('/').filter(Boolean);
  const firstSlug = slugs[0] as string | undefined;
  if (firstSlug === undefined) {
    return undefined;
  }

  const section = sections.find((item) => item.slug === firstSlug);
  if (section === undefined) {
    return undefined;
  }

  // tslint:disable-next-line
  return slugs.slice(1).reduce((acc: SectionConfig | undefined, slug: string) => {
    if (acc === undefined) {
      return undefined;
    }

    return section.sections.find((item) => item.slug === slug);
  }, section);
};
