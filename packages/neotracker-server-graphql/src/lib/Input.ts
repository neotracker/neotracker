// tslint:disable-next-line no-unnecessary-class
export class Input {
  public static readonly inputName: string;
  public static readonly definition: { readonly [argName: string]: string };

  public static get typeDef(): string {
    return `
      input ${this.inputName} {
        ${Object.entries(this.definition)
          .map(([fieldName, typeName]) => `${fieldName}: ${typeName}`)
          .join('\n          ')}
      }
    `;
  }
}
