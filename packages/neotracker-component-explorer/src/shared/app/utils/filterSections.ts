import _ from 'lodash';
import { SectionConfig } from '../../../types';

export const filterSections = (sections: ReadonlyArray<SectionConfig>, input: string): ReadonlyArray<SectionConfig> => {
  const normalizedInput = _.kebabCase(input)
    .trim()
    .replace(/\s+/, '');

  return sections.reduce((acc: ReadonlyArray<SectionConfig>, section) => {
    if (section.slug.includes(normalizedInput)) {
      return [...acc, section];
    }

    const childSections = filterSections(section.sections, normalizedInput);
    if (childSections.length) {
      return [...acc, { ...section, sections: childSections }];
    }

    return acc;
  }, []);
};
