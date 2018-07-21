import { PropInfo, SectionConfig } from '../../../types';
import { findSectionUses } from './findSectionUses';

export interface SectionToPropInfo {
  readonly [name: string]: PropInfo;
}
export const findSectionPropInfo = (
  sections: ReadonlyArray<SectionConfig>,
  section: SectionConfig,
): SectionToPropInfo => ({
  ...(section.type !== 'component' ? {} : { [section.name]: section.component.props }),
  ...findSectionUses(sections, section).reduce<SectionToPropInfo>(
    (acc, usedSection) => ({
      ...acc,
      ...findSectionPropInfo(sections, usedSection),
    }),
    {},
  ),
});
