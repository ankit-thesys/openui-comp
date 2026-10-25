/**
 * Source-linked public export inventory for the #31 in-scope families.
 *
 * Why the TypeScript compiler rather than grepping barrels: `src/index.ts` is a
 * chain of `export *` re-exports, so a grep tells you which barrel is forwarded,
 * not which NAMES the package root actually exposes. During setup a grep for
 * "Markdown" missed `MarkDownRenderer` entirely (capital D), which is exactly the
 * failure mode #31 warns about ("do not assume every named family is separately
 * exported"). The compiler resolves the real export set and gives a declaration
 * file + line for every name, which is what "source-linked" requires.
 *
 * Resolution note: this file lives under validation/, which is NOT a pnpm
 * workspace member, so bare specifiers do not resolve from here. Every import is
 * resolved through packages/react-ui's own install via createRequire. No
 * dependency, lockfile or shared-config change is needed.
 *
 * Usage (from the repository root):
 *   node validation/friend-text-media-baseline/tools/inventory.mjs
 *   node validation/friend-text-media-baseline/tools/inventory.mjs --json
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OWNED = path.resolve(HERE, "..");
const REPO = path.resolve(OWNED, "../..");
const REACT_UI = path.join(REPO, "packages/react-ui");

const require = createRequire(path.join(REACT_UI, "package.json"));
const ts = require("typescript");

/**
 * The #31 scope, grouped as the ticket groups it. Membership is asserted against
 * the compiler's real export set below -- a name listed here that is NOT exported
 * is reported as a discrepancy rather than silently assumed present.
 */
const SCOPE = {
  "text/presentation": [
    "InlineMarkdownRenderer",
    // Added after the dependency map showed IconText/ImageText/ImageTextLarge all
    // import it. It is package-root exported (src/index.ts:126) and is plainly a
    // text/presentation family, so omitting it would have left a hole exactly of
    // the kind #31 warns about.
    "TextBlock",
    "MarkDownRenderer",
    "CodeBlock",
    "IconText",
    "IconTag",
    "InlineHeader",
    "ListBlock",
    "ListItem",
    "Separator",
    "Steps",
  ],
  images: ["Image", "ImageBlock", "ImageGallery", "ImageText", "ImageTextLarge"],
  "citations/sources": ["Citation", "Sources", "SourceFaviconImage"],
  table: ["Table"],
};

/** Declared dependencies of in-scope families that are themselves out of scope (#31 item 2). */
const DEPENDENCY_ONLY = ["Carousel", "IconButton"];

/**
 * Adjacent but deliberately NOT claimed: EditableTable is table-shaped, but #31
 * assigns data/card baselines to another contributor and says "Do not duplicate
 * Table into the data/card task". Recorded so ownership is explicit either way.
 */
const ADJACENT_UNCLAIMED = ["EditableTable"];

const program = ts.createProgram([path.join(REACT_UI, "src/index.ts")], {
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ESNext,
  allowJs: false,
  noEmit: true,
  skipLibCheck: true,
  strict: false,
});
const checker = program.getTypeChecker();
const entry = program.getSourceFile(path.join(REACT_UI, "src/index.ts"));
if (!entry) throw new Error("could not load packages/react-ui/src/index.ts");

const moduleSymbol = checker.getSymbolAtLocation(entry);
if (!moduleSymbol) throw new Error("src/index.ts resolved no module symbol");

const rel = (f) => path.relative(REPO, f).split(path.sep).join("/");

/** Follow aliases to the real declaration, and report where it lives. */
function declarationsOf(symbol) {
  let target = symbol;
  if (symbol.flags & ts.SymbolFlags.Alias) {
    try {
      target = checker.getAliasedSymbol(symbol);
    } catch {
      target = symbol;
    }
  }
  const decls = target.getDeclarations() ?? [];
  return decls.map((d) => {
    const sf = d.getSourceFile();
    const { line } = sf.getLineAndCharacterOfPosition(d.getStart());
    return { file: rel(sf.fileName), line: line + 1, kind: ts.SyntaxKind[d.kind] };
  });
}

/** Classify a symbol as a value (component/function) or a type-only export. */
function classify(symbol) {
  let target = symbol;
  if (symbol.flags & ts.SymbolFlags.Alias) {
    try {
      target = checker.getAliasedSymbol(symbol);
    } catch {
      /* keep */
    }
  }
  const f = target.flags;
  if (f & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) return "type";
  if (f & ts.SymbolFlags.Enum) return "enum";
  if (f & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable | ts.SymbolFlags.Class)) return "value";
  return "other";
}

const allExports = checker.getExportsOfModule(moduleSymbol);
const byName = new Map();
for (const sym of allExports) {
  const name = sym.getName();
  byName.set(name, {
    name,
    kind: classify(sym),
    declarations: declarationsOf(sym),
  });
}

/**
 * Group every exported name under the in-scope family whose source directory
 * declares it. This is how subcomponents and prop types get attributed without
 * guessing from name prefixes: `TableCell` belongs to Table because it is
 * DECLARED under components/Table, not because it starts with "Table".
 */
function familyOf(entryRec) {
  for (const d of entryRec.declarations) {
    const m = d.file.match(/^packages\/react-ui\/src\/components\/([^/]+)\//);
    if (m) return m[1];
  }
  return null;
}

const families = new Map();
for (const rec of byName.values()) {
  const fam = familyOf(rec);
  if (!fam) continue;
  if (!families.has(fam)) families.set(fam, []);
  families.get(fam).push(rec);
}

const revision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO }).toString().trim();

const report = {
  revision,
  generatedBy: "validation/friend-text-media-baseline/tools/inventory.mjs",
  entryPoint: "packages/react-ui/src/index.ts",
  totalRootExports: byName.size,
  typescript: ts.version,
  scope: {},
  dependencyOnly: {},
  adjacentUnclaimed: {},
  discrepancies: [],
};

for (const [group, names] of Object.entries(SCOPE)) {
  report.scope[group] = {};
  for (const fam of names) {
    const members = families.get(fam);
    if (!members) {
      report.discrepancies.push(
        `scope lists "${fam}" but no package-root export is declared under components/${fam}/`,
      );
      report.scope[group][fam] = { exported: false, members: [] };
      continue;
    }
    report.scope[group][fam] = {
      exported: true,
      members: members
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((m) => ({ name: m.name, kind: m.kind, at: m.declarations[0] ?? null })),
    };
  }
}

for (const [bucket, names] of [
  ["dependencyOnly", DEPENDENCY_ONLY],
  ["adjacentUnclaimed", ADJACENT_UNCLAIMED],
]) {
  for (const fam of names) {
    const members = families.get(fam) ?? [];
    report[bucket][fam] = {
      exported: members.length > 0,
      members: members
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((m) => ({ name: m.name, kind: m.kind, at: m.declarations[0] ?? null })),
    };
  }
}

/** Families that exist on disk but expose nothing from the package root. */
const onDisk = execFileSync("ls", [path.join(REACT_UI, "src/components")])
  .toString()
  .trim()
  .split("\n");
const claimed = new Set([
  ...Object.values(SCOPE).flat(),
  ...DEPENDENCY_ONLY,
  ...ADJACENT_UNCLAIMED,
]);
for (const fam of claimed) {
  if (!onDisk.includes(fam)) {
    report.discrepancies.push(`"${fam}" is claimed by this inventory but has no source directory`);
  }
}

const outJson = path.join(OWNED, "docs/inventory.json");
writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

// ---------------------------------------------------------------------------
// Markdown rendering. Generated rather than hand-written so the prose cannot
// drift from the compiler's answer; docs/inventory.md says so at the top.
// ---------------------------------------------------------------------------
const GH = "https://github.com/ankit-thesys/openui-comp/blob";
const link = (at) =>
  at ? `[\`${at.file.replace("packages/react-ui/src/components/", "")}:${at.line}\`](${GH}/${report.revision}/${at.file}#L${at.line})` : "—";

const familyTable = (fams) => {
  const lines = ["| Family | Export | Kind | Declared at |", "|---|---|---|---|"];
  for (const [fam, info] of Object.entries(fams)) {
    if (!info.exported) {
      lines.push(`| \`${fam}\` | — | — | **NOT EXPORTED** |`);
      continue;
    }
    info.members.forEach((m, i) => {
      lines.push(
        `| ${i === 0 ? `\`${fam}\`` : ""} | \`${m.name}\` | ${m.kind} | ${link(m.at)} |`,
      );
    });
  }
  return lines.join("\n");
};

let md = `# Source-linked inventory (#31)

> **Generated** by \`tools/inventory.mjs\` — do not hand-edit. Regenerate with
> \`node validation/friend-text-media-baseline/tools/inventory.mjs\`.
> \`tests/inventory.test.ts\` fails if this drifts from the checked-out revision
> or names an export that cannot be imported.

| | |
|---|---|
| Revision | \`${report.revision}\` |
| Entry point | \`${report.entryPoint}\` |
| TypeScript | ${report.typescript} |
| Total package-root exports | ${report.totalRootExports} |
| In-scope families | ${Object.values(report.scope).reduce((n, g) => n + Object.keys(g).length, 0)} |
| In-scope exports | ${Object.values(report.scope).reduce((n, g) => n + Object.values(g).reduce((m, f) => m + f.members.length, 0), 0)} |
| Discrepancies | ${report.discrepancies.length === 0 ? "none" : report.discrepancies.length} |

Derived with the TypeScript compiler, not by grepping barrels: \`src/index.ts\` is
a chain of \`export *\`, so a grep shows which barrel is forwarded, not which NAMES
the package root exposes. During setup a grep for "Markdown" missed
\`MarkDownRenderer\` entirely because of its capital D — exactly the failure #31
warns about. Subcomponents are attributed by DECLARATION SITE, not name prefix.

`;

for (const [group, fams] of Object.entries(report.scope)) {
  md += `## ${group}\n\n${familyTable(fams)}\n\n`;
}
md += `## Dependency-only (out of scope, recorded for #12)\n\n${familyTable(report.dependencyOnly)}\n\n`;
md += `## Adjacent, deliberately unclaimed\n\n${familyTable(report.adjacentUnclaimed)}\n\n`;
md += report.discrepancies.length
  ? `## Discrepancies\n\n${report.discrepancies.map((d) => `- ${d}`).join("\n")}\n`
  : `## Discrepancies\n\nNone: every claimed family resolves to real package-root exports.\n`;

writeFileSync(path.join(OWNED, "docs/inventory.md"), md);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`revision          ${report.revision}`);
  console.log(`typescript        ${report.typescript}`);
  console.log(`root exports      ${report.totalRootExports}`);
  console.log("");
  let valueCount = 0;
  let typeCount = 0;
  for (const [group, fams] of Object.entries(report.scope)) {
    console.log(`## ${group}`);
    for (const [fam, info] of Object.entries(fams)) {
      if (!info.exported) {
        console.log(`  ${fam.padEnd(24)} NOT EXPORTED`);
        continue;
      }
      const v = info.members.filter((m) => m.kind === "value");
      const t = info.members.filter((m) => m.kind !== "value");
      valueCount += v.length;
      typeCount += t.length;
      console.log(`  ${fam.padEnd(24)} ${v.length} value(s), ${t.length} type(s)`);
      for (const m of info.members) {
        console.log(`      ${m.kind.padEnd(5)} ${m.name.padEnd(30)} ${m.at ? m.at.file + ":" + m.at.line : "?"}`);
      }
    }
    console.log("");
  }
  console.log(`in-scope totals   ${valueCount} values, ${typeCount} types`);
  console.log("");
  console.log("## dependency-only (out of scope, recorded for #12)");
  for (const [fam, info] of Object.entries(report.dependencyOnly)) {
    console.log(`  ${fam.padEnd(24)} ${info.members.length} export(s)`);
  }
  console.log("");
  console.log("## adjacent, deliberately unclaimed");
  for (const [fam, info] of Object.entries(report.adjacentUnclaimed)) {
    console.log(`  ${fam.padEnd(24)} ${info.members.length} export(s)`);
  }
  console.log("");
  if (report.discrepancies.length) {
    console.log("## DISCREPANCIES");
    for (const d of report.discrepancies) console.log(`  - ${d}`);
  } else {
    console.log("no discrepancies: every claimed family resolves to real package-root exports");
  }
  console.log("");
  console.log(`wrote ${path.relative(REPO, outJson)}`);
}
