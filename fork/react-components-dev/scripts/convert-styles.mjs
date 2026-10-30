// One-off migration tool. Edit source ranges rather than printing an AST: CSS template text,
// object property order and the sequence of registrations must survive byte for byte.
import { library } from "#paths";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import prettier from "prettier";
import ts from "typescript";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const paths = args.filter((arg) => arg !== "--dry-run");
if (!paths.length || paths.some((arg) => arg.startsWith("--"))) {
  console.error("Usage: node scripts/convert-styles.mjs [--dry-run] components/Button ...");
  process.exit(1);
}
const root = library("src/");
const selected = paths.map((path) => {
  const full = resolve(root, path);
  if (!full.startsWith(root) || !statSync(full)) throw new Error(`Not inside library src: ${path}`);
  return full;
});
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name);
    return entry.isDirectory() ? walk(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
const files = walk(root).sort();
const config = ts.readConfigFile(library("tsconfig.json"), ts.sys.readFile);
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, library());
const program = ts.createProgram(files, options);
const checker = program.getTypeChecker();
const symbolOf = (node) => {
  const symbol = checker.getSymbolAtLocation(node);
  return symbol?.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
};
const each = (node, visit) => {
  visit(node);
  ts.forEachChild(node, (child) => each(child, visit));
};
const unwrap = (node) => (ts.isParenthesizedExpression(node) ? unwrap(node.expression) : node);
const edits = new Map();
const converted = new Map();
const imports = new Map();
const registrationImports = new Set();
const reports = new Set();
const report = (node, message) => {
  const file = node.getSourceFile();
  const { line } = file.getLineAndCharacterOfPosition(node.getStart());
  reports.add(`${relative(root, file.fileName)}:${line + 1}: ${message}`);
};
const edit = (file, start, end, text) => {
  const changes = edits.get(file) ?? [];
  changes.push({ start, end, text });
  edits.set(file, changes);
};
const replace = (node, text) => edit(node.getSourceFile(), node.getStart(), node.end, text);
const removeItem = (file, items, index) => {
  const item = items[index];
  const start = index === 0 ? item.getStart() : items[index - 1].end;
  const end = index === 0 && items.length > 1 ? items[1].getStart() : item.end;
  edit(file, start, end, "");
};

for (const path of files) {
  if (!selected.some((dir) => path === dir || path.startsWith(dir + sep))) continue;
  const file = program.getSourceFile(path);
  each(file, (node) => {
    if (!ts.isArrowFunction(node) && !ts.isFunctionDeclaration(node)) return;
    const index = node.parameters.findIndex((param) => {
      if (!param.type || !ts.isTypeReferenceNode(param.type)) return false;
      const declaration = checker.getSymbolAtLocation(param.type.typeName)?.declarations?.[0];
      return (
        declaration &&
        ts.isImportSpecifier(declaration) &&
        (declaration.propertyName ?? declaration.name).text === "StyleCss" &&
        declaration.parent.parent.parent.moduleSpecifier.text.endsWith("/styles/useStyles")
      );
    });
    if (index < 0) return;
    const param = node.parameters[index];
    if (
      !ts.isIdentifier(param.name) ||
      param.initializer ||
      param.dotDotDotToken ||
      node.type ||
      node.typeParameters ||
      node.modifiers?.some((modifier) => modifier.kind !== ts.SyntaxKind.ExportKeyword) ||
      (ts.isFunctionDeclaration(node) && (!node.name || !node.body || node.asteriskToken))
    ) {
      report(node, "unsupported style helper signature; convert by hand");
      return;
    }
    const binding = param.name.text;
    const existing = file.statements
      .filter(ts.isImportDeclaration)
      .flatMap((statement) =>
        statement.importClause?.namedBindings &&
        ts.isNamedImports(statement.importClause.namedBindings)
          ? statement.importClause.namedBindings.elements
              .filter((item) => item.name.text === binding)
              .map((item) => ({ statement, item }))
          : [],
      );
    const compatible = existing.every(
      ({ statement, item }) =>
        statement.moduleSpecifier.text.endsWith("/styles/css") &&
        (item.propertyName ?? item.name).text === "css",
    );
    if (
      !compatible ||
      file.statements.some(
        (statement) =>
          ts.isVariableStatement(statement) &&
          statement.declarationList.declarations.some(
            (decl) => decl.name.getText(file) === binding,
          ),
      )
    ) {
      report(node, `module binding ${binding} conflicts with the css import`);
      return;
    }
    if (node.parameters.length > 1) {
      if (!ts.isVariableDeclaration(node.parent) && !ts.isFunctionDeclaration(node)) {
        report(node, "parameterized helper must have a named variable; convert by hand");
        return;
      }
      const needed = imports.get(file) ?? new Set();
      if (!existing.length) needed.add(binding);
      imports.set(file, needed);
      removeItem(file, node.parameters, index);
      converted.set(symbolOf(ts.isFunctionDeclaration(node) ? node.name : node.parent.name), {
        kind: "helper",
        index,
      });
      return;
    }
    let owner = node;
    while (ts.isParenthesizedExpression(owner.parent)) owner = owner.parent;
    let definition;
    let kind = "constant";
    if (ts.isFunctionDeclaration(node) && ts.isSourceFile(node.parent)) definition = node.name;
    else if (
      ts.isVariableDeclaration(owner.parent) &&
      ts.isSourceFile(owner.parent.parent.parent.parent)
    )
      definition = owner.parent.name;
    else {
      let outer = owner.parent;
      if (ts.isReturnStatement(outer) && ts.isBlock(outer.parent)) outer = outer.parent.parent;
      if (ts.isArrowFunction(outer) && ts.isVariableDeclaration(outer.parent)) {
        definition = outer.parent.name;
        kind = "builder";
      } else if (ts.isFunctionDeclaration(outer) && ts.isSourceFile(outer.parent)) {
        definition = outer.name;
        kind = "builder";
      }
    }
    if (!definition || !ts.isIdentifier(definition)) {
      report(node, "unsupported factory owner; convert by hand");
      return;
    }
    const needed = imports.get(file) ?? new Set();
    if (!existing.length) needed.add(binding);
    imports.set(file, needed);
    const body = unwrap(node.body);
    const prefix = ts.isFunctionDeclaration(node)
      ? `${node.modifiers?.length ? "export " : ""}const ${node.name.text} = `
      : "";
    if (ts.isBlock(body)) {
      edit(file, node.getStart(), body.getStart(), `${prefix}/*#__PURE__*/ (() => `);
      edit(file, body.end, node.end, ts.isFunctionDeclaration(node) ? ")();" : ")()");
    } else {
      edit(file, node.getStart(), body.getStart(), "/*#__PURE__*/ ");
      edit(file, body.end, node.end, "");
    }
    converted.set(symbolOf(definition), { kind });
  });
}

// Follow aliases and helpers that used to return factories, including imports with local aliases.
let added;
do {
  added = false;
  for (const path of files)
    each(program.getSourceFile(path), (node) => {
      if (!ts.isVariableDeclaration(node) || !node.initializer) return;
      const value = unwrap(node.initializer);
      const source = converted.get(symbolOf(ts.isCallExpression(value) ? value.expression : value));
      const symbol = symbolOf(node.name);
      if (
        !converted.has(symbol) &&
        source &&
        ((!ts.isCallExpression(value) && source.kind === "constant") ||
          (ts.isCallExpression(value) && source.kind === "builder"))
      ) {
        converted.set(symbol, { kind: "constant" });
        added = true;
      }
    });
} while (added);

for (const path of files) {
  const file = program.getSourceFile(path);
  each(file, (node) => {
    if (!ts.isCallExpression(node)) return;
    const declaration = checker.getSymbolAtLocation(node.expression)?.declarations?.[0];
    const isHook =
      declaration &&
      ts.isImportSpecifier(declaration) &&
      (declaration.propertyName ?? declaration.name).text === "useStyles" &&
      declaration.parent.parent.parent.moduleSpecifier.text.endsWith("/styles/useStyles");
    const arg = node.arguments[0];
    const value = arg && unwrap(arg);
    const argumentKind =
      value && converted.get(symbolOf(ts.isCallExpression(value) ? value.expression : value));
    if (
      isHook &&
      node.arguments.length === 1 &&
      argumentKind &&
      (ts.isCallExpression(value)
        ? argumentKind.kind === "builder"
        : argumentKind.kind === "constant")
    ) {
      edit(file, node.getStart(), arg.getStart(), "");
      edit(file, arg.end, node.end, "");
      return;
    }
    const conversion = converted.get(symbolOf(node.expression));
    if (conversion?.kind === "constant") {
      if (node.arguments.length !== 1 || node.arguments[0].getText(file) !== "css") {
        report(node, "unexpected factory call arguments; convert by hand");
        return;
      }
      if (ts.isExpressionStatement(node.parent)) {
        replace(node.parent, "");
        const imported = checker.getSymbolAtLocation(node.expression)?.declarations?.[0];
        if (imported && ts.isImportSpecifier(imported))
          registrationImports.add(imported.parent.parent.parent);
      } else edit(file, node.expression.end, node.end, "");
    } else if (conversion?.kind === "helper") {
      if (node.arguments.length <= conversion.index) report(node, "missing css helper argument");
      else removeItem(file, node.arguments, conversion.index);
    }
  });
}

let changed = 0;
for (const [file, changes] of edits) {
  let text = file.text;
  let boundary = text.length + 1;
  for (const { start, end, text: replacement } of changes.sort((a, b) => b.start - a.start)) {
    if (end > boundary)
      throw new Error(`Overlapping edits in ${file.fileName}; no output for this file`);
    text = text.slice(0, start) + replacement + text.slice(end);
    boundary = start;
  }
  const updated = ts.createSourceFile(file.fileName, text, ts.ScriptTarget.Latest, true);
  const used = new Set();
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement))
      each(statement, (node) => {
        if (
          ts.isIdentifier(node) &&
          !changes.some(({ start, end }) => start <= node.getStart() && node.end <= end)
        ) {
          used.add(checker.getSymbolAtLocation(node));
        }
      });
  }
  const cleanups = [];
  for (const statement of updated.statements.filter(ts.isImportDeclaration)) {
    const clause = statement.importClause;
    if (!clause?.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;
    const original = file.statements.find(
      (item) => ts.isImportDeclaration(item) && item.getText(file) === statement.getText(updated),
    );
    const registration = registrationImports.has(original);
    const kept = clause.namedBindings.elements.filter((item) => {
      const binding = original.importClause.namedBindings.elements.find(
        (binding) => binding.name.text === item.name.text,
      );
      return (
        used.has(checker.getSymbolAtLocation(binding.name)) ||
        (!registration &&
          !["useStyles", "StyleCss", "StyleFactory"].includes(
            (item.propertyName ?? item.name).text,
          ))
      );
    });
    if (kept.length === clause.namedBindings.elements.length) continue;
    const named = kept.length ? `{ ${kept.map((item) => item.getText(updated)).join(", ")} }` : "";
    const bindings = [clause.name?.text, named].filter(Boolean).join(", ");
    const replacement = bindings
      ? `import ${clause.isTypeOnly ? "type " : ""}${bindings} from ${statement.moduleSpecifier.getText(updated)};`
      : registration
        ? `import ${statement.moduleSpecifier.getText(updated)};`
        : "";
    const nextLine = text.indexOf("\n", statement.end);
    const end =
      !replacement && nextLine >= 0 && !text.slice(statement.end, nextLine).trim()
        ? nextLine + 1
        : statement.end;
    cleanups.push({ start: statement.getStart(), end, replacement });
  }
  for (const { start, end, replacement } of cleanups.reverse())
    text = text.slice(0, start) + replacement + text.slice(end);
  const needed = imports.get(file);
  if (needed?.size) {
    let specifier = relative(dirname(file.fileName), library("src/styles/css"))
      .split(sep)
      .join("/");
    if (!specifier.startsWith(".")) specifier = "./" + specifier;
    const declaration = `import { ${[...needed].map((name) => (name === "css" ? name : `css as ${name}`)).join(", ")} } from "${specifier}";\n\n`;
    const parsed = ts.createSourceFile(file.fileName, text, ts.ScriptTarget.Latest, true);
    const firstImport = parsed.statements.find(ts.isImportDeclaration);
    const directives = parsed.statements.filter(
      (item) => ts.isExpressionStatement(item) && ts.isStringLiteral(item.expression),
    );
    const at = firstImport?.getStart() ?? directives.at(-1)?.end ?? 0;
    text = text.slice(0, at) + (at && !firstImport ? "\n\n" : "") + declaration + text.slice(at);
  }
  text = await prettier.format(text, {
    ...(await prettier.resolveConfig(file.fileName)),
    filepath: file.fileName,
    plugins: [],
  });
  if (text === file.text) continue;
  if (!dryRun) writeFileSync(file.fileName, text);
  console.log(`${dryRun ? "Would convert" : "Converted"}: ${relative(root, file.fileName)}`);
  changed++;
}
for (const path of files.filter((path) =>
  selected.some((dir) => path === dir || path.startsWith(dir + sep)),
)) {
  const text = readFileSync(path, "utf8");
  if (!dryRun && /\b(useStyles|StyleCss|StyleFactory)\b/.test(text))
    reports.add(`${relative(root, path)}: old API remains (including comments); review by hand`);
}
console.log(`${changed} file(s) ${dryRun ? "would change" : "changed"}.`);
console.log(
  reports.size
    ? `Could not fully convert:\n${[...reports].join("\n")}`
    : "No unsupported conversions.",
);
