import webpack from 'webpack';

const MODULE_MAP: ReadonlyArray<readonly [RegExp, string]> = [
  // [/^@neo-one\/(?!ec-key|boa|csharp)(.+)(?!-es2018-esm)$/, '@neo-one/$1-es2018-esm'],
];
export const createModuleMapperPlugins = () =>
  MODULE_MAP.map(
    ([regex, value]) =>
      // tslint:disable-next-line deprecation
      new webpack.NormalModuleReplacementPlugin(
        regex,
        // tslint:disable-next-line no-any
        (resource: any) => {
          if (!resource.request.includes('es2018-esm')) {
            // tslint:disable-next-line no-object-mutation
            resource.request = resource.request.replace(regex, value);
          }
        },
      ),
  );
