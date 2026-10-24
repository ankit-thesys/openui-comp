import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repository = path.resolve(packageRoot, "../..");

test(
  "core builds in isolation with no legacy React UI source or style inputs",
  { timeout: 30000 },
  async () => {
    const isolated = await fs.mkdtemp(path.join(tmpdir(), "openui-core-build-"));
    const core = path.join(isolated, "packages/react-ui-core");
    try {
      await fs.mkdir(core, { recursive: true });
      for (const file of ["package.json", "tsconfig.json", "tsdown.config.ts"])
        await fs.copyFile(path.join(packageRoot, file), path.join(core, file));
      await fs.cp(path.join(packageRoot, "src"), path.join(core, "src"), { recursive: true });
      await fs.copyFile(
        path.join(repository, "tsconfig.json"),
        path.join(isolated, "tsconfig.json"),
      );
      // Reuse installed tooling/dependencies; copy no legacy package into the fixture.
      await fs.symlink(
        path.join(repository, "node_modules"),
        path.join(isolated, "node_modules"),
        "dir",
      );
      await fs.symlink(
        path.join(packageRoot, "node_modules"),
        path.join(core, "node_modules"),
        "dir",
      );
      await assert.rejects(fs.access(path.join(isolated, "packages/react-ui")), { code: "ENOENT" });
      try {
        execFileSync(path.join(repository, "node_modules/.bin/tsdown"), [], {
          cwd: core,
          encoding: "utf8",
          stdio: "pipe",
        });
      } catch (error) {
        throw new Error(`Isolated build failed:\n${error.stdout || ""}${error.stderr || ""}`, {
          cause: error,
        });
      }
      for (const file of ["index.mjs", "index.cjs", "index.d.mts", "index.d.cts"])
        assert((await fs.stat(path.join(core, "dist", file))).size > 0);
      const entries = await fs.readdir(path.join(core, "dist"), { recursive: true });
      assert(entries.every((name) => !/\.(css|scss)$/.test(name)));
    } finally {
      await fs.rm(isolated, { recursive: true, force: true });
    }
  },
);
