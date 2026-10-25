import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
test("the public archive setup accepts react-ui and react-ui-core together without prefix ambiguity", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "comparison-setup-"));
  try {
    const example = path.join(root, "example"),
      source = path.join(root, "packed");
    await fs.mkdir(path.join(example, "scripts"), { recursive: true });
    await fs.mkdir(source);
    await fs.copyFile(
      "scripts/setup-artifacts.mjs",
      path.join(example, "scripts/setup-artifacts.mjs"),
    );
    await fs.copyFile("package.json", path.join(example, "package.json"));
    const names = [
      "lang-core-1.0.1",
      "observability-0.0.4",
      "devtools-0.3.0",
      "react-lang-1.0.1",
      "react-ui-0.18.1",
      "react-ui-core-0.0.0-beta.0",
      "kits-0.0.0-beta.0",
    ];
    for (const name of names)
      await fs.writeFile(path.join(source, `openuidev-${name}.tgz`), name);
    const result = spawnSync(
      process.execPath,
      [path.join(example, "scripts/setup-artifacts.mjs"), `--from=${source}`],
      { cwd: example, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      await fs.readFile(
        path.join(example, ".artifacts/openuidev-react-ui-0.18.1.tgz"),
        "utf8",
      ),
      "react-ui-0.18.1",
    );
    assert.equal(
      await fs.readFile(
        path.join(
          example,
          ".artifacts/openuidev-react-ui-core-0.0.0-beta.0.tgz",
        ),
        "utf8",
      ),
      "react-ui-core-0.0.0-beta.0",
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
