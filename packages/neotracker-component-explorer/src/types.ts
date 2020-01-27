// tslint:disable no-any
import * as React from 'react';

export const REPLACE_ME = '__REPLACE_ME__';
export const REPLACE_DATA_ME = '__REPLACE_DATA_ME__';

export type ReactElement = React.ReactElement;
export type Props<E extends ReactElement> = E extends React.ReactElement<infer P> ? P : never;
export interface Example<E extends ReactElement = ReactElement> {
  readonly component?: React.ComponentType<any>;
  readonly element: (ref?: React.RefObject<any>) => E;
  readonly data?: FixtureData;
}
export type CTExample<C extends React.ComponentType<any>> = C extends React.ComponentType<infer P>
  ? Example<React.ReactElement<P>>
  : never;
export type CExample<C extends React.Component<any>> = C extends React.Component<infer P>
  ? Example<React.ReactElement<P>>
  : never;
export type PExample<P> = Example<React.ReactElement<P>>;

export interface FixtureData {
  readonly [fixtureName: string]: any;
}

export interface ProxyChildrenProps<E extends ReactElement = any> {
  readonly element: E;
  readonly data: FixtureData;
  readonly props?: Partial<Props<E>>;
  readonly onUpdateFixtureData: (data: FixtureData) => void;
}
export interface ProxyProps<E extends ReactElement = ReactElement> extends ProxyChildrenProps<E> {
  readonly children: (props: ProxyChildrenProps<E>) => React.ReactNode;
}
export type Proxy<E extends ReactElement = ReactElement> = React.ComponentType<ProxyProps<E>>;

export interface Wrapper {
  readonly unmount: () => void;
}
export type Renderer<W extends Wrapper = Wrapper, Options = {}> = (element: ReactElement, options?: Options) => W;

/* Component Explorer Frontend Configuration */
export type EvalInContext = (
  example: string,
) => () => {
  readonly element: (ref?: React.Ref<ReactElement>) => ReactElement;
  readonly data: () => FixtureData;
};
export interface MarkdownContentConfig {
  readonly type: 'markdown';
  readonly content: string;
}
export interface CodeContentConfig {
  readonly type: 'code';
  readonly code: string;
  readonly fixtureCode: string;
  readonly exampleTemplate: string;
}
export type ContentConfig = MarkdownContentConfig | CodeContentConfig;
export interface Prop {
  readonly type: string;
  readonly required: boolean;
  readonly description: string;
  readonly defaultValue?: string;
}
export interface PropInfo {
  readonly [propName: string]: Prop;
}
export interface RenderAPIInfo {
  readonly [name: string]: {
    readonly type: string;
    readonly initialValue: string;
    readonly description: string;
  };
}
export interface ComponentConfig {
  readonly id: string;
  readonly content: ReadonlyArray<ContentConfig>;
  readonly props: PropInfo;
  readonly uses: ReadonlyArray<string>;
  readonly usedBy: ReadonlyArray<string>;
  readonly renderAPI?: RenderAPIInfo;
  readonly evalInContext?: EvalInContext;
}
export interface SectionConfigArray extends ReadonlyArray<SectionConfig> {}
export interface SectionConfigBase {
  readonly slug: string;
  readonly name: string;
  readonly sections: SectionConfigArray;
  readonly filePath?: string;
  readonly absoluteFilePath?: string;
}
export interface ComponentSectionConfig extends SectionConfigBase {
  readonly type: 'component';
  readonly component: ComponentConfig;
}
export interface ContentSectionConfig extends SectionConfigBase {
  readonly type: 'content';
  readonly content: MarkdownContentConfig;
}
export interface EmptySectionConfig extends SectionConfigBase {
  readonly type: 'empty';
}
export type SectionConfig = ComponentSectionConfig | ContentSectionConfig | EmptySectionConfig;
export interface EditorConfig {}
export interface MetaConfig {
  readonly title: string;
  readonly name: string;
  readonly description: string;
}
export interface RenderConfig {
  readonly meta: MetaConfig;
  readonly editorConfig: EditorConfig;
  readonly sections: ReadonlyArray<SectionConfig>;
  readonly proxies: ReadonlyArray<Proxy>;
}

/* Node Configuration */
export interface ExplorerConfig {
  readonly configDir: string;
  readonly meta: MetaConfig;
  readonly editorConfig: EditorConfig;
  readonly componentsDir: string;
  readonly tsconfig: string;
  readonly serverPort: number;
  readonly serverHost: string;
  readonly proxies: {
    readonly node: ReadonlyArray<Proxy>;
    readonly browser?: string;
  };
  readonly dependencies: ReadonlyArray<string>;
}

/* Loader Results Configuration */
export interface LoaderMarkdownConfig {
  readonly filePath: string;
  readonly content: string;
}
export interface LoaderComponentExample {
  readonly id: string;
  readonly exampleTemplate: string;
  readonly example: {
    readonly code: string;
    readonly returnText: string;
  };
  readonly fixture: {
    readonly code: string;
    readonly returnText: string;
  };
}
export interface LoaderComponent {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly dependencies: ReadonlyArray<string>;
  readonly props: PropInfo;
  readonly renderAPI?: RenderAPIInfo;
}
export interface LoaderTypescriptConfig {
  readonly filePath: string;
  readonly absoluteFilePath: string;
  readonly examples: ReadonlyArray<LoaderComponentExample>;
  readonly components: ReadonlyArray<LoaderComponent>;
  readonly evalInContext: EvalInContext;
}
export interface LoaderRenderConfig {
  readonly meta: MetaConfig;
  readonly editorConfig: EditorConfig;
  readonly markdown: ReadonlyArray<LoaderMarkdownConfig>;
  readonly typescript: ReadonlyArray<LoaderTypescriptConfig>;
  readonly proxies: ReadonlyArray<Proxy>;
}

// tslint:disable-next-line
export type ComponentProps<C extends React.ComponentType<any> | React.Component<any>> = any;

// export type ComponentProps<C extends React.ComponentType<any> | React.Component<any>> = C extends React.SFC<infer P>
//   ? P
//   : C extends React.ComponentClass<infer P2> ? P2 : C extends React.Component<infer P1> ? P1 : never;
