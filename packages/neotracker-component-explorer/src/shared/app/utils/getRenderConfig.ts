import _ from 'lodash';
import {
  CodeContentConfig,
  ComponentSectionConfig,
  ContentConfig,
  ContentSectionConfig,
  EvalInContext,
  LoaderComponentExample,
  LoaderMarkdownConfig,
  LoaderRenderConfig,
  MarkdownContentConfig,
  RenderConfig,
  SectionConfig,
} from '../../../types';
import { notNull } from '../../utils';
import * as mdUtils from './markdown';
import * as path from './path';
import { slugger } from './slugger';

export const getRenderConfig = (config: LoaderRenderConfig): RenderConfig => {
  slugger.reset();

  return {
    meta: config.meta,
    editorConfig: config.editorConfig,
    sections: parseSections(config),
    proxies: config.proxies,
  };
};

interface DirToMarkdown {
  readonly [dir: string]: ContentSectionConfig | undefined;
}
interface UsedBy {
  // tslint:disable-next-line readonly-keyword readonly-array
  [componentID: string]: string[];
}

interface AdditionalComponentInfo {
  readonly id: string;
  readonly dependencies: ReadonlyArray<string>;
  readonly filePath: string;
  readonly dir: string;
}

type Component = Omit<ComponentSectionConfig, 'filePath'> & AdditionalComponentInfo;

const parseSections = (config: LoaderRenderConfig): ReadonlyArray<SectionConfig> => {
  const { components, remainingMarkdown } = getComponents(config);

  const mutableUsedBy: UsedBy = {};
  components.forEach((component) => {
    component.dependencies.forEach((id) => {
      // tslint:disable-next-line readonly-keyword readonly-array
      if ((mutableUsedBy[id] as string[] | undefined) === undefined) {
        mutableUsedBy[id] = [];
      }

      mutableUsedBy[id].push(component.id);
    });
  });

  const getUsedBy = (id: string) => {
    if ((mutableUsedBy[id] as string[] | undefined) === undefined) {
      return [];
    }

    return mutableUsedBy[id];
  };

  const componentIDs = new Set(components.map(({ id }) => id));
  const withSlugs = _.sortBy(components, ({ filePath }) => filePath, ({ name }) => name).map<Component>(
    (component) => ({
      ...component,
      component: {
        ...component.component,
        uses: component.dependencies.filter((id) => componentIDs.has(id)),
        usedBy: getUsedBy(component.id),
      },
      slug: slugger.slug(component.name),
      filePath: component.filePath,
    }),
  );

  const firstPass = withSlugs.reduce((acc: ReadonlyArray<Component>, component) => {
    const parent = acc.find((section) => component.name.startsWith(section.name) && component.dir === section.dir);

    if (parent) {
      return [
        ...acc.filter((section) => section.name !== parent.name),
        { ...parent, sections: [...parent.sections, component] },
      ];
    }

    return [...acc, component];
  }, []);

  const dirMarkdown = _.sortBy(remainingMarkdown, ({ filePath }) => filePath)
    .filter(({ filePath }) => path.basename(filePath, '.md') === 'README')
    .reduce<DirToMarkdown>(
      (acc, markdown) => ({
        ...acc,
        [path.dirname(markdown.filePath)]: getContentSectionConfig(markdown),
      }),
      {},
    );

  return firstPass.reduce((acc: ReadonlyArray<SectionConfig>, component) => {
    const parent = dirMarkdown[component.dir];
    if (parent) {
      const existingParent = acc.find((section) => section.name === parent.name);
      const currentParent = existingParent === undefined ? parent : existingParent;

      return [
        ...acc.filter((section) => section.name !== currentParent.name),
        { ...currentParent, sections: [...currentParent.sections, component] },
      ];
    }

    return [...acc, component];
  }, []);
};

type ComponentWithoutSlug = Omit<ComponentSectionConfig, 'slug'> & AdditionalComponentInfo;

const getComponents = (
  config: LoaderRenderConfig,
): {
  readonly components: ReadonlyArray<ComponentWithoutSlug>;
  readonly remainingMarkdown: ReadonlyArray<LoaderMarkdownConfig>;
} => {
  const componentIDToMarkdown = getComponentIDToMarkdown(config);
  const componentIDToExamples = getComponentIDToExamples(config);

  const mutableUsedMarkdown = new Set<string>();
  const processedComponents = config.typescript.reduce(
    (acc: ReadonlyArray<ComponentWithoutSlug>, { filePath, absoluteFilePath, components }) =>
      acc.concat(
        components.map<ComponentWithoutSlug>((component) => {
          const markdown = componentIDToMarkdown[component.id];
          const value = componentIDToExamples[component.id];
          let examples: ReadonlyArray<LoaderComponentExample> | undefined;
          let evalInContext: EvalInContext | undefined;
          if (value !== undefined) {
            examples = value.examples;
            evalInContext = value.evalInContext;
          }
          if (markdown !== undefined) {
            mutableUsedMarkdown.add(markdown.filePath);
          }

          return {
            type: 'component',
            name: component.displayName,
            sections: [],
            component: {
              id: component.id,
              content: getContent(markdown, examples),
              props: component.props,
              uses: [],
              usedBy: [],
              renderAPI: component.renderAPI,
              evalInContext,
            },
            id: component.id,
            dependencies: component.dependencies,
            filePath,
            absoluteFilePath,
            dir: path.dirname(filePath),
          };
        }),
      ),
    [],
  );

  const remainingMarkdown = Object.values(componentIDToMarkdown)
    .filter(notNull)
    .filter(({ filePath }) => !mutableUsedMarkdown.has(filePath));

  return { components: processedComponents, remainingMarkdown };
};

interface ComponentIDToMarkdown {
  readonly [id: string]: LoaderMarkdownConfig | undefined;
}

const getComponentIDToMarkdown = (config: LoaderRenderConfig): ComponentIDToMarkdown =>
  config.markdown.reduce<ComponentIDToMarkdown>((acc, markdown) => {
    const { id, content } = getMarkdownComponentID(markdown);

    return {
      ...acc,
      [id]: {
        ...markdown,
        content,
      },
    };
  }, {});

const getMarkdownComponentID = (markdown: LoaderMarkdownConfig): { readonly id: string; readonly content: string } => {
  const { metadata, rawContent } = mdUtils.extractMetadata(markdown.content);
  // tslint:disable-next-line
  // TODO: Think about how this should work
  const id = metadata.id;

  const name = path.basename(markdown.filePath, '.md');

  return {
    id: id === undefined ? `${path.join(path.dirname(markdown.filePath), name)}.tsx:${name}` : id,
    content: rawContent,
  };
};

interface ComponentIDToExamples {
  readonly [id: string]:
    | {
        readonly examples: ReadonlyArray<LoaderComponentExample>;
        readonly evalInContext: EvalInContext;
      }
    | undefined;
}

const getComponentIDToExamples = (config: LoaderRenderConfig): ComponentIDToExamples =>
  config.typescript.reduce<ComponentIDToExamples>((acc, { examples, evalInContext }) => {
    if (examples.length === 0) {
      return acc;
    }

    const id = examples[0].id;

    return {
      ...acc,
      [id]: { examples, evalInContext },
    };
  }, {});

const getContent = (
  markdown?: LoaderMarkdownConfig,
  examples?: ReadonlyArray<LoaderComponentExample>,
): ReadonlyArray<ContentConfig> => {
  if (examples === undefined) {
    if (markdown !== undefined) {
      return [{ type: 'markdown', content: markdown.content }];
    }

    return [];
  }

  const codeContent = examples.map<CodeContentConfig>(({ example, fixture, exampleTemplate }) => ({
    type: 'code',
    code: `${example.code}\n${example.returnText}`,
    fixtureCode: `${fixture.code}\n${fixture.returnText}`,
    exampleTemplate,
  }));
  if (markdown === undefined) {
    return codeContent;
  }

  const processedMarkdown = processMarkdown(markdown.content);

  return processedMarkdown.map((value) => (value.type === 'code' ? codeContent[value.idx] : value));
};

interface CodeIndex {
  readonly type: 'code';
  readonly idx: number;
}

const processMarkdown = (markdown: string): ReadonlyArray<MarkdownContentConfig | CodeIndex> => {
  const splitMarkdown = markdown.split(/<\*\*EXAMPLE\*\*>/);

  return splitMarkdown.reduce<ReadonlyArray<MarkdownContentConfig | CodeIndex>>((acc, content, idx) => {
    const markdownValue: MarkdownContentConfig = { type: 'markdown', content };
    if (splitMarkdown.length - 1 === idx) {
      return acc.concat([markdownValue]);
    }

    return acc.concat([markdownValue, { type: 'code', idx }]);
  }, []);
};

const getContentSectionConfig = ({ filePath, content }: LoaderMarkdownConfig): ContentSectionConfig => {
  const name = path.basename(path.dirname(filePath));

  return {
    type: 'content',
    slug: slugger.slug(name),
    name,
    sections: [],
    content: {
      type: 'markdown',
      content,
    },
  };
};
