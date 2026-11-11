import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import ts from "typescript";
import { expect, test } from "vitest";

const src = resolve(import.meta.dirname, "../../packages/libraries/dashboard/src");

// Explicit exceptions to the dependency direction, expressed as "source -> import". Runtime
// adapters belong in lib/ or shared/, outside the plain components; a shared module may read the
// OpenUI Lang runtime only to hand Query or streaming state to visuals as plain values, and each
// such module is listed here (#231).
const exceptions: readonly string[] = [
  // useQueryState: streaming, Query loading and Query failure, for the shared empty states.
  "shared/queryState.ts -> @openuidev/react-lang",
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.[cm]?[jt]sx?$/.test(path) ? [path] : [];
  });
}

/** Parse module references, including re-exports, type imports, require and dynamic imports. */
function imports(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const found: string[] = [];
  function visit(node: ts.Node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      found.push(node.moduleSpecifier.text);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      found.push(node.moduleReference.expression.text);
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require")) &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      found.push(node.arguments[0].text);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    ) {
      found.push(node.argument.literal.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return found;
}

function under(path: string, dir: string): boolean {
  return path === dir || path.startsWith(`${dir}${sep}`);
}

const isPackage = (specifier: string, name: string) =>
  specifier === name || specifier.startsWith(`${name}/`);

for (const area of ["components", "shared"]) {
  test(`${area} imports only allowed dependencies`, () => {
    const files = sourceFiles(join(src, area));
    expect(files.length).toBeGreaterThan(0);
    const violations = files.flatMap((file) =>
      imports(file).flatMap((specifier) => {
        const target = specifier.startsWith(".")
          ? resolve(dirname(file), specifier)
          : resolve(specifier);
        const forbidden =
          under(target, join(src, "lib")) ||
          isPackage(specifier, "@openuidev/react-lang") ||
          (area === "components"
            ? isPackage(specifier, "zod")
            : under(target, join(src, "components")));
        const edge = `${relative(src, file)} -> ${specifier}`;
        return forbidden && !exceptions.includes(edge) ? [edge] : [];
      }),
    );
    expect(violations).toEqual([]);
  });
}

// A definition passes each prop explicitly, so a field whose type drifts from the component's
// props fails the build. A field added to the schema and never passed on would not; the
// SchemaCovered type (lib/schemaCoverage.ts) catches that, so every definition declares one.
test("every OpenUI Lang definition checks its schema reaches its component", () => {
  const definitions = sourceFiles(join(src, "lib")).filter((file) =>
    /[\\/]lib[\\/][^\\/]+[\\/][A-Z][^\\/]*[\\/]index\.tsx$/.test(file),
  );
  expect(definitions.length).toBeGreaterThan(0);
  const missing = definitions
    .filter((file) => readFileSync(file, "utf8").includes("defineComponent("))
    .filter(
      (file) =>
        !/export type \w+SchemaCovered = Covered<\s*SchemaCoverage</.test(
          readFileSync(file, "utf8"),
        ),
    )
    .map((file) => relative(src, file));
  expect(missing).toEqual([]);
});
