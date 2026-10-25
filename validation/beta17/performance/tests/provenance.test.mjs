import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { installedInventory } from "../provenance.mjs";

test("installed inventory resolves public entry points and detects dist changes and missing locks", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "beta17-installed-test-"));
  try {
    await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ private: true }));
    await fs.writeFile(path.join(root, "package-lock.json"), "synthetic lock");
    for (const [name, exports] of [
      ["react-ui-core", { ".": "./dist/index.js" }],
      ["kits", { "./react/chat": "./dist/index.js" }],
    ]) {
      const directory = path.join(root, "node_modules", "@openuidev", name);
      await fs.mkdir(path.join(directory, "dist"), { recursive: true });
      await fs.writeFile(
        path.join(directory, "package.json"),
        JSON.stringify({ name: `@openuidev/${name}`, exports }),
      );
      await fs.writeFile(
        path.join(directory, "dist", "index.js"),
        "// synthetic installed artifact\n",
      );
    }
    const before = await installedInventory(root);
    assert.equal(Object.keys(before).length, 6);
    const changed = await fs.realpath(
      path.join(root, "node_modules", "@openuidev", "kits", "dist", "index.js"),
    );
    await fs.appendFile(changed, "// changed\n");
    assert.notEqual((await installedInventory(root))[changed], before[changed]);
    const kit = path.join(root, "node_modules", "@openuidev", "kits");
    const workspace = path.join(root, "workspace-kit");
    await fs.rename(kit, workspace);
    await fs.symlink(workspace, kit, "dir");
    await assert.rejects(installedInventory(root), /outside.*node_modules/);
    await fs.unlink(kit);
    await fs.rename(workspace, kit);
    await fs.unlink(path.join(root, "package-lock.json"));
    await assert.rejects(installedInventory(root), /lockfile/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("owned context closes before browser and a context failure does not skip browser cleanup", async () => {
  const { closeArm } = await import("../browser.mjs");
  const events = [];
  await closeArm({
    context: {
      close: async () => {
        events.push("context");
      },
    },
    browser: {
      close: async () => {
        events.push("browser");
      },
    },
  });
  assert.deepEqual(events, ["context", "browser"]);
  let attempted = false;
  await assert.rejects(
    closeArm({
      context: {
        close: async () => {
          throw new Error("context failed");
        },
      },
      browser: {
        close: async () => {
          attempted = true;
        },
      },
    }),
    /cleanup/,
  );
  assert.equal(attempted, true);
});
