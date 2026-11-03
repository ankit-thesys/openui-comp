/**
 * Runs the same capture on the kit. The tests do this themselves; this is for looking at the result.
 *
 *   PARITY_OUT=/some/file.json PARITY_SHOTS=/some/folder node src/__tests__/parity/capture-kit.ts
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { captureTarget, HARNESS, serveHarness, writeJson } from "./driver.ts";

const out = process.env.PARITY_OUT;
if (!out) throw new Error("Set PARITY_OUT to the file to write");

const server = await serveHarness(
  HARNESS,
  path.join(HARNESS, "target.kit.ts"),
  mkdtempSync(path.join(tmpdir(), "parity-")),
);
writeJson(out, await captureTarget(server.url, { screenshots: process.env.PARITY_SHOTS }));
await server.close();
process.exit(0);
