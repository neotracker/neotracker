import { SectionConfig } from '../../../types';
import { flattenSections } from './flattenSections';
import { hasContent } from './hasContent';

// tslint:disable-next-line: export-name
export const findNonEmptySiblingSection = (
  sections: ReadonlyArray<SectionConfig>,
  name: string,
  findPrevious = false,
): SectionConfig | undefined => {
  const flattenedSections = findPrevious ? flattenSections(sections).reverse() : flattenSections(sections);
  const currentIndex = flattenedSections.findIndex((x) => x.name === name);
  if (currentIndex >= 0) {
    return flattenedSections.slice(currentIndex + 1).find(hasContent);
  }

  return undefined;
};
