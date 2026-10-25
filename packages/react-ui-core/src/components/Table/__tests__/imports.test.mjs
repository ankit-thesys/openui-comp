import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
const consumer = process.env.CORE_CONSUMER
  ? path.resolve(process.env.CORE_CONSUMER)
  : fileURLToPath(new URL("../../../../", import.meta.url));
const names = [
  "Table",
  "ScrollableTable",
  "TableHeader",
  "TableBody",
  "TableFooter",
  "TableRow",
  "TableHead",
  "TableCell",
  "CodeBlock",
  "MarkDownRenderer",
  "InlineMarkdownRenderer",
  "CardSourceProvider",
  "CardSourceSchema",
  "TextContentCitation",
  "safeUrl",
  "safeOpenUrl",
];
for (const mode of ["module", "commonjs"])
  test(`native ${mode} resolves Table, markdown and source prerequisite root APIs`, () => {
    const code =
      (mode === "module"
        ? "import * as core from '@openuidev/react-ui-core';"
        : "const core=require('@openuidev/react-ui-core');") +
      `for(const name of ${JSON.stringify(names)})if(!core[name])throw Error('Missing '+name);if(core.safeUrl('javascript:alert(1)')!==undefined)throw Error('URL policy widened');`;
    const result = spawnSync(process.execPath, ["--input-type=" + mode, "-e", code], {
      cwd: consumer,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });
