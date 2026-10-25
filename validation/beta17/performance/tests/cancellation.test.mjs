import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const cli = fileURLToPath(new URL("../summarize.mjs", import.meta.url));
test("the cancellation checker accepts a real partially delivered aborted HTTP stream, not a completed request", async () => {
  // Harness proof only: this small HTTP server is not the OpenUI workload fixture.
  let active = 0,
    cancelled = 0;
  let closed;
  const closeObserved = new Promise((resolve) => {
    closed = resolve;
  });
  const server = http.createServer((req, res) => {
    active++;
    res.writeHead(200, { "content-type": "text/plain" });
    res.write("partial");
    res.once("close", () => {
      active--;
      cancelled++;
      closed();
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "beta17-cancel-test-"));
  const controller = new AbortController();
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/`, {
      signal: controller.signal,
    });
    const reader = response.body.getReader();
    const first = await reader.read();
    const partialBefore = new TextDecoder().decode(first.value);
    const activeBefore = active,
      cancelledBefore = cancelled;
    controller.abort();
    let abortError;
    try {
      await reader.read();
    } catch (error) {
      abortError = error.name;
    }
    await closeObserved;
    const manifest = { cells: { "chat/paced": { expectedText: "partial completed" } } };
    const observation = {
      workload: "chat",
      load: "paced",
      activeBefore,
      partialBefore,
      abortError,
      activeAfter: active,
      timersAfter: 0,
      cancelledBefore,
      cancelledAfter: cancelled,
    };
    await fs.writeFile(path.join(root, "manifest.json"), JSON.stringify(manifest));
    const reportFile = path.join(root, "report.json");
    await fs.writeFile(reportFile, JSON.stringify({ kind: "cancellation", observation }));
    const result = await exec(process.execPath, [
      cli,
      path.join(root, "manifest.json"),
      reportFile,
    ]);
    assert.equal(JSON.parse(result.stdout).pass, true);
    await fs.writeFile(
      reportFile,
      JSON.stringify({
        kind: "cancellation",
        observation: { ...observation, activeBefore: 0, partialBefore: "partial completed" },
      }),
    );
    await assert.rejects(
      exec(process.execPath, [cli, path.join(root, "manifest.json"), reportFile]),
      (error) => {
        const summary = JSON.parse(error.stdout);
        assert.equal(summary.pass, false);
        assert.match(summary.errors.join(" "), /active|partial|complete/i);
        return true;
      },
    );
  } finally {
    controller.abort();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(root, { recursive: true, force: true });
  }
});
