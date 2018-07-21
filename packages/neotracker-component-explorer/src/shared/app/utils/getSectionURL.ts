import { SectionConfig } from '../../../types';

export const getSectionURL = (sections: ReadonlyArray<SectionConfig>, name: string, prepend = '/'): string =>
  sections
    .reduce(
      (slugs, section) => {
        if (section.name === name) {
          return [...slugs, section.slug];
        }
        if (section.sections.length > 0) {
          const slugsString = slugs.join('');
          const childUrl = getSectionURL(section.sections, name, slugsString);
          if (childUrl !== slugsString) {
            return [...slugs, section.slug, childUrl];
          }
        }

        return slugs;
      },
      [prepend],
    )
    .join('');
