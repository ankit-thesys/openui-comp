import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
test("the runner refuses to read fixtures or launch browsers without quiet-window release", async () => {
  const env = { ...process.env };
  delete env.BETA17_QUIET_WINDOW_RELEASED;
  await assert.rejects(
    exec(
      process.execPath,
      [
        fileURLToPath(new URL("../run.mjs", import.meta.url)),
        "benchmark",
        "/missing/fixture.json",
        "/missing/results",
      ],
      { env },
    ),
    (error) => {
      assert.match(error.stderr, /fixture freeze and quiet-window release/);
      assert.doesNotMatch(error.stderr, /ENOENT|browserType.launch/);
      return true;
    },
  );
});
