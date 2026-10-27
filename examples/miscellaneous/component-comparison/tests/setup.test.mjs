import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
test("archive setup follows candidate paths and preserves historical packages", async () => {
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
    await fs.copyFile(
      "scripts/archive-paths.mjs",
      path.join(example, "scripts/archive-paths.mjs"),
    );
    const manifest = JSON.parse(await fs.readFile("package.json", "utf8"));
    delete manifest.dependencies["@openuidev/react-ui-core"];
    manifest.dependencies["@openuidev/react-components"] =
      "file:.artifacts/candidate/openuidev-react-components-0.0.0-beta.0.tgz";
    for (const [name, value] of Object.entries(manifest.dependencies))
      if (value.startsWith("file:"))
        manifest.dependencies[name] =
          "file:.artifacts/candidate/" + path.basename(value.slice(5));
    await fs.writeFile(
      path.join(example, "package.json"),
      JSON.stringify(manifest),
    );
    await fs.mkdir(path.join(example, ".artifacts"));
    await fs.writeFile(
      path.join(example, ".artifacts/openuidev-kits-0.0.0-beta.0.tgz"),
      "historical",
    );
    const names = [
      "lang-core-1.0.1",
      "observability-0.0.4",
      "devtools-0.3.0",
      "react-lang-1.0.1",
      "react-ui-0.18.1",
      "react-components-0.0.0-beta.0",
      "chat-kit-0.0.0-beta.0",
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
        path.join(
          example,
          ".artifacts/candidate/openuidev-react-ui-0.18.1.tgz",
        ),
        "utf8",
      ),
      "react-ui-0.18.1",
    );
    assert.equal(
      await fs.readFile(
        path.join(
          example,
          ".artifacts/candidate/openuidev-react-components-0.0.0-beta.0.tgz",
        ),
        "utf8",
      ),
      "react-components-0.0.0-beta.0",
    );
    assert.equal(
      await fs.readFile(
        path.join(example, ".artifacts/openuidev-kits-0.0.0-beta.0.tgz"),
        "utf8",
      ),
      "historical",
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
