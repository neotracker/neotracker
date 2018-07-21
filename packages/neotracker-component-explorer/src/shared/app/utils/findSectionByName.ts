import { SectionConfig } from '../../../types';
import { flattenSections } from './flattenSections';

export const findSectionByName = (sections: ReadonlyArray<SectionConfig>, name: string) =>
  flattenSections(sections).find((section) => section.name === name);
