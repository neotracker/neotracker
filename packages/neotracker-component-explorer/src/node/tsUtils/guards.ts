import ts from 'typescript';

// tslint:disable-next-line
export const isExpression = (node: ts.Node): node is ts.Expression => {
  switch (node.kind) {
    case ts.SyntaxKind.AnyKeyword:
    case ts.SyntaxKind.BooleanKeyword:
    case ts.SyntaxKind.NeverKeyword:
    case ts.SyntaxKind.NumberKeyword:
    case ts.SyntaxKind.ObjectKeyword:
    case ts.SyntaxKind.StringKeyword:
    case ts.SyntaxKind.SymbolKeyword:
    case ts.SyntaxKind.UndefinedKeyword:
    case ts.SyntaxKind.Identifier:
    case ts.SyntaxKind.AsExpression:
    case ts.SyntaxKind.AwaitExpression:
    case ts.SyntaxKind.BinaryExpression:
    case ts.SyntaxKind.CallExpression:
    case ts.SyntaxKind.CommaListExpression:
    case ts.SyntaxKind.ConditionalExpression:
    case ts.SyntaxKind.DeleteExpression:
    case ts.SyntaxKind.ElementAccessExpression:
    case ts.SyntaxKind.ImportKeyword:
    case ts.SyntaxKind.MetaProperty:
    case ts.SyntaxKind.NewExpression:
    case ts.SyntaxKind.NonNullExpression:
    case ts.SyntaxKind.OmittedExpression:
    case ts.SyntaxKind.ParenthesizedExpression:
    case ts.SyntaxKind.PartiallyEmittedExpression:
    case ts.SyntaxKind.PostfixUnaryExpression:
    case ts.SyntaxKind.PrefixUnaryExpression:
    case ts.SyntaxKind.PropertyAccessExpression:
    case ts.SyntaxKind.SpreadElement:
    case ts.SyntaxKind.SuperKeyword:
    case ts.SyntaxKind.ThisKeyword:
    case ts.SyntaxKind.TypeAssertionExpression:
    case ts.SyntaxKind.TypeOfExpression:
    case ts.SyntaxKind.VoidKeyword:
    case ts.SyntaxKind.YieldExpression:
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.JsxClosingFragment:
    case ts.SyntaxKind.JsxElement:
    case ts.SyntaxKind.JsxExpression:
    case ts.SyntaxKind.JsxFragment:
    case ts.SyntaxKind.JsxOpeningElement:
    case ts.SyntaxKind.JsxOpeningFragment:
    case ts.SyntaxKind.JsxSelfClosingElement:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.NullKeyword:
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.RegularExpressionLiteral:
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.ArrayLiteralExpression:
    case ts.SyntaxKind.ObjectLiteralExpression:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
    case ts.SyntaxKind.TaggedTemplateExpression:
    case ts.SyntaxKind.TemplateExpression:
      return true;
    default:
      return false;
  }
};

export const isStatement = (node: ts.Node): node is ts.Statement => {
  switch (node.kind) {
    case ts.SyntaxKind.ClassDeclaration:
    case ts.SyntaxKind.EnumDeclaration:
    case ts.SyntaxKind.ExportAssignment:
    case ts.SyntaxKind.ExportDeclaration:
    case ts.SyntaxKind.ImportDeclaration:
    case ts.SyntaxKind.ImportEqualsDeclaration:
    case ts.SyntaxKind.InterfaceDeclaration:
    case ts.SyntaxKind.ModuleDeclaration:
    case ts.SyntaxKind.Block:
    case ts.SyntaxKind.BreakStatement:
    case ts.SyntaxKind.ContinueStatement:
    case ts.SyntaxKind.DebuggerStatement:
    case ts.SyntaxKind.DoStatement:
    case ts.SyntaxKind.EmptyStatement:
    case ts.SyntaxKind.ExpressionStatement:
    case ts.SyntaxKind.ForInStatement:
    case ts.SyntaxKind.ForOfStatement:
    case ts.SyntaxKind.ForStatement:
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.IfStatement:
    case ts.SyntaxKind.LabeledStatement:
    case ts.SyntaxKind.NotEmittedStatement:
    case ts.SyntaxKind.ReturnStatement:
    case ts.SyntaxKind.SwitchStatement:
    case ts.SyntaxKind.ThrowStatement:
    case ts.SyntaxKind.TryStatement:
    case ts.SyntaxKind.VariableStatement:
    case ts.SyntaxKind.WhileStatement:
    case ts.SyntaxKind.WithStatement:
    case ts.SyntaxKind.TypeAliasDeclaration:
      return true;
    default:
      return false;
  }
};
