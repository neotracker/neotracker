// tslint:disable-next-line no-unnecessary-class
export class Type {
  public static readonly typeName: string;
  public static readonly definition: { readonly [argName: string]: string };

  public static get typeDef(): string {
    const implementsNode = (this.definition.id as string | undefined) === undefined ? '' : 'implements Node ';

    return `
      type ${this.typeName} ${implementsNode}{
        ${Object.entries(this.definition)
          .map(([fieldName, typeName]) => `${fieldName}: ${typeName}`)
          .join('\n          ')}
      }
    `;
  }
}
