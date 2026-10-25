import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
const consumer = path.resolve(process.env.CORE_CONSUMER);
const require = createRequire(path.join(consumer, "package.json"));
const tools = createRequire(path.join(process.env.CORE_BROWSER_TOOLS, "package.json"));
const packagePath = path.join(consumer, "node_modules/@openuidev/react-ui-core");
assert(!(await fs.lstat(packagePath)).isSymbolicLink());
const hash = (b) => createHash("sha256").update(b).digest("hex");
const lockBefore = hash(await fs.readFile(path.join(consumer, "package-lock.json")));
const names = [
  "EditableTable",
  "EditableTableChangesBar",
  "EntityList",
  "ListItem",
  "ListBlock",
  "MetricIndicatorInline",
  "MetricIndicatorWithStrikethrough",
  "OverviewCardBlock",
  "SnippetCardBlock",
  "CompositeCard",
  "CompositeCardBlock",
  "ContextCard",
  "ContextCardBlock",
  "VisualCard",
  "VisualCardBlock",
];
const cjs = require("@openuidev/react-ui-core");
const esm = await import(pathToFileURL(path.join(packagePath, "dist/index.mjs")).href);
for (const name of names) {
  assert(cjs[name], name);
  assert(esm[name], name);
}
assert.deepEqual(Object.keys(cjs).sort(), Object.keys(esm).sort());
for (const name of ["CardBlockLayout", "CellOutline", "getCellRenderer", "MetricIndicator"])
  assert(!(name in cjs), `private/absent ${name}`);
assert.throws(() => require("@openuidev/react-ui-core/EditableTable"), {
  code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
});
const types = await fs.readFile(new URL("./consumer-types.ts.txt", import.meta.url), "utf8");
for (const extension of ["ts", "mts", "cts"]) {
  const file = path.join(consumer, "consumer." + extension);
  await fs.writeFile(file, types);
  execFileSync(
    process.execPath,
    [
      path.join(consumer, "node_modules/typescript/bin/tsc"),
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "false",
      "--target",
      "es2022",
      "--module",
      extension === "ts" ? "esnext" : "nodenext",
      "--moduleResolution",
      extension === "ts" ? "bundler" : "nodenext",
      file,
    ],
    { stdio: "pipe" },
  );
}
const { build } = tools("esbuild");
const pruning = [];
for (const name of [
  "Button",
  "EditableTable",
  "CompositeCardBlock",
  "ContextCardBlock",
  "VisualCardBlock",
]) {
  const result = await build({
    stdin: {
      contents: `import {${name}} from '@openuidev/react-ui-core'; console.log(${name});`,
      resolveDir: consumer,
    },
    bundle: true,
    external: ["*.css"],
    platform: "browser",
    format: "esm",
    minify: true,
    write: false,
    metafile: true,
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const retained = Object.values(result.metafile.outputs).flatMap((out) =>
    Object.entries(out.inputs)
      .filter(([, v]) => v.bytesInOutput > 0)
      .map(([n]) => n),
  );
  assert(
    retained.some((n) => n.includes("/components/" + name + "/")),
    name,
  );
  assert(
    retained.every((n) => !n.includes("packages/react-ui/src")),
    "no legacy source",
  );
  const other = names.filter(
    (n) => n !== name && !["Button", "EditableTableChangesBar"].includes(n),
  );
  for (const family of other)
    assert(
      !retained.some((n) => n.includes("/components/" + family + "/")),
      `${name} retained unrelated ${family}`,
    );
  pruning.push({
    name,
    bytes: result.outputFiles[0].contents.length,
    sha256: hash(result.outputFiles[0].contents),
    retained,
  });
}
assert.equal(
  hash(await fs.readFile(path.join(consumer, "package-lock.json"))),
  lockBefore,
  "consumer lock unchanged",
);
console.log(
  JSON.stringify(
    {
      status: "passed",
      nativeExports: names,
      strictModes: ["Bundler", "NodeNext ESM", "NodeNext CJS"],
      lockSha256: lockBefore,
      pruning,
      scope: "JS/Goober only; vendor CSS externalized, no SSR/performance certification",
    },
    null,
    2,
  ),
);
