import { SectionConfig } from '../../../types';
import { notNull } from '../../utils';
import { findSectionByID } from './findSectionByID';

export const findSectionUses = (
  sections: ReadonlyArray<SectionConfig>,
  section: SectionConfig,
  prop: 'uses' | 'usedBy' = 'uses',
) => {
  if (section.type !== 'component') {
    return [];
  }

  return section.component[prop].map((id) => findSectionByID(sections, id)).filter(notNull);
};
