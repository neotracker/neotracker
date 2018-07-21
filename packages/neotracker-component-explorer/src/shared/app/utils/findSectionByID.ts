import { SectionConfig } from '../../../types';
import { flattenSections } from './flattenSections';

export const findSectionByID = (sections: ReadonlyArray<SectionConfig>, id: string) =>
  flattenSections(sections).find((section) => section.type === 'component' && section.component.id === id);
