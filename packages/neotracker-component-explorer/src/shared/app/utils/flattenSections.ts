import { SectionConfig } from '../../../types';

export const flattenSections = (sections: ReadonlyArray<SectionConfig>): ReadonlyArray<SectionConfig> =>
  sections.reduce(
    (acc: ReadonlyArray<SectionConfig>, section) => [...acc, section, ...flattenSections(section.sections)],
    [],
  );
