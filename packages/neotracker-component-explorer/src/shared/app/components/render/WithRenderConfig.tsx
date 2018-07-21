import * as React from 'react';
import { RenderConfig } from '../../../../types';

// tslint:disable-next-line no-any
const WithRenderConfigBase = React.createContext<RenderConfig>(undefined as any);

export const RenderConfigProvider = WithRenderConfigBase.Provider;
export const WithRenderConfig = WithRenderConfigBase.Consumer;
