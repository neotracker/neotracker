import ts from 'typescript';

// tslint:disable no-bitwise
// const hasSymbolFlag = (symbol: ts.Symbol, flag: ts.SymbolFlags): boolean => (symbol.getFlags() & flag) === flag;
const hasAnySymbolFlag = (symbol: ts.Symbol, flag: ts.SymbolFlags): boolean => (symbol.getFlags() & flag) !== 0;
// tslint:enable no-bitwise

export const getValueDeclaration = (symbol: ts.Symbol): ts.Declaration | undefined => symbol.valueDeclaration;
export const getDeclarations = (symbol: ts.Symbol): ReadonlyArray<ts.Declaration> =>
  (symbol.declarations as ReadonlyArray<ts.Declaration> | undefined) === undefined ? [] : symbol.declarations;
export const getDeclaration = (symbol: ts.Symbol): ts.Declaration | undefined => {
  const valueDeclaration = getValueDeclaration(symbol);

  return valueDeclaration === undefined ? getDeclarations(symbol)[0] : valueDeclaration;
};

export const isOptional = (symbol: ts.Symbol): boolean => hasAnySymbolFlag(symbol, ts.SymbolFlags.Optional);
