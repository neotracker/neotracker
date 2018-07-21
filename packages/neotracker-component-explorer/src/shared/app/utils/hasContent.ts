import { SectionConfig } from '../../../types';

export const hasContent = (section: SectionConfig) => section.type === 'component' || section.type === 'content';
