import ts from 'typescript';

export const getParent = (node: ts.Node): ts.Node | undefined => node.parent;
// tslint:disable-next-line no-any
export const getLocalSymbol = (node: ts.Node): ts.Symbol | undefined => (node as any).localSymbol;
export const getNumericLiteralValue = (node: ts.NumericLiteral) => {
  const text = node.text;
  if (text.includes('.')) {
    return parseFloat(text);
  }

  return parseInt(text, 10);
};
export const getStringLiteralValue = (node: ts.StringLiteralLike) => node.text;
export const getLiteralValue = (node: ts.Node): string | number | undefined => {
  if (ts.isStringLiteralLike(node)) {
    return getStringLiteralValue(node);
  }

  if (ts.isNumericLiteral(node)) {
    return getNumericLiteralValue(node);
  }

  return undefined;
};
export const getName = (node: ts.Node): string | undefined => {
  // tslint:disable-next-line no-any
  const name = (node as any).name;
  if (ts.isIdentifier(name)) {
    return name.getText();
  }

  if (ts.isStringLiteral(name)) {
    return getStringLiteralValue(name);
  }

  if (ts.isNumericLiteral(name)) {
    return `${getNumericLiteralValue(name)}`;
  }

  return undefined;
};
export const getProperty = (
  node: ts.ObjectLiteralExpression,
  property: string,
): ts.ObjectLiteralElementLike | undefined => node.properties.find((value) => getName(value) === property);
