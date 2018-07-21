import { ContentConfig, SectionConfig } from '../../../types';
import { assertNever } from '../../utils';

export const getSectionContent = (section: SectionConfig): ReadonlyArray<ContentConfig> => {
  switch (section.type) {
    case 'component':
      return section.component.content;
    case 'content':
      return [section.content];
    case 'empty':
      return [];
    default:
      assertNever(section);

      return [];
  }
};
