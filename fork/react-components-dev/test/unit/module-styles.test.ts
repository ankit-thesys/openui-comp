// Rules created during render apply after that task, so library styles must register on import.
import { library } from "#paths";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";
import { expect, it } from "vitest";

it("calls the library's css and keyframes only at module top level", () => {
  const root = library("src");
  const files = readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
    .map((file) => join(root, file));
  const program = ts.createProgram(files, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    skipLibCheck: true,
    noEmit: true,
    allowJs: true,
  });
  const checker = program.getTypeChecker();
  const styling = program.getSourceFile(library("src/styles/css.ts"))!;
  const exports = checker.getExportsOfModule(checker.getSymbolAtLocation(styling)!);
  const registrations = new Set(
    exports.filter((symbol) => ["css", "keyframes"].includes(symbol.name)),
  );
  // Resolve import aliases, namespace access, barrel re-exports and local const aliases.
  const original = (
    expression: ts.Expression,
    seen = new Set<ts.Symbol>(),
  ): ts.Symbol | undefined => {
    if (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression))
      return original(expression.expression, seen);
    let symbol = checker.getSymbolAtLocation(expression);
    while (symbol && !seen.has(symbol)) {
      seen.add(symbol);
      if (symbol.flags & ts.SymbolFlags.Alias) {
        symbol = checker.getAliasedSymbol(symbol);
        continue;
      }
      if (registrations.has(symbol)) return symbol;
      const declaration = symbol.valueDeclaration;
      if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer)
        return original(declaration.initializer, seen);
      if (declaration && ts.isBindingElement(declaration)) {
        const binding = declaration.parent;
        const variable = binding.parent;
        const property = declaration.propertyName ?? declaration.name;
        if (
          ts.isObjectBindingPattern(binding) &&
          ts.isVariableDeclaration(variable) &&
          variable.initializer &&
          (ts.isIdentifier(property) || ts.isStringLiteral(property))
        ) {
          symbol = checker.getTypeAtLocation(variable.initializer).getProperty(property.text);
          continue;
        }
      }
      return symbol;
    }
    return undefined;
  };
  const violations: string[] = [];
  for (const file of files) {
    const source = program.getSourceFile(file)!;
    const visit = (node: ts.Node) => {
      const expression = ts.isTaggedTemplateExpression(node)
        ? node.tag
        : ts.isCallExpression(node)
          ? node.expression
          : undefined;
      if (expression && registrations.has(original(expression)!)) {
        for (let parent = node.parent; parent && !ts.isSourceFile(parent); parent = parent.parent) {
          if (
            ts.isFunctionLike(parent) ||
            ts.isClassLike(parent) ||
            (ts.isStatement(parent) &&
              !ts.isVariableStatement(parent) &&
              !ts.isExpressionStatement(parent) &&
              !ts.isExportAssignment(parent))
          ) {
            const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
            violations.push(`${relative(root, file)}:${line + 1}:${character + 1}`);
            break;
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  expect(violations, "move css/keyframes registration to module top level").toEqual([]);
});
