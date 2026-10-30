/**
 * Records how the real open-intelligent-ui app looks and behaves, into fixtures/source-baseline.json.
 * The tests compare the kit against that file, so they never need the app or the network.
 *
 *   PARITY_SOURCE=/path/to/open-intelligent-ui node src/__tests__/parity/capture-source.ts
 *
 * The checkout must be at the commit in fixtures/SOURCE.json with its dependencies installed.
 * PARITY_SHOTS=/some/folder also saves a screenshot of each program.
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { captureTarget, FIXTURES, HARNESS, serveHarness, SOURCE_MODES, writeJson } from "./driver.ts";

const source = process.env.PARITY_SOURCE;
if (!source) throw new Error("Set PARITY_SOURCE to a checkout of open-intelligent-ui");

const pinned = JSON.parse(readFileSync(path.join(FIXTURES, "SOURCE.json"), "utf8")) as { commit: string };
const head = execFileSync("git", ["-C", source, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (head !== pinned.commit) throw new Error(`The checkout is at ${head}, not ${pinned.commit}`);

// The harness runs from inside the checkout, so its imports use the source app's own dependencies.
const root = path.join(source, ".parity-harness");
rmSync(root, { recursive: true, force: true });
mkdirSync(root);
cpSync(HARNESS, root, { recursive: true });

const server = await serveHarness(root, path.join(root, "target.source.ts"), path.join(root, "dist"));
const captured = await captureTarget(server.url, {
  modes: SOURCE_MODES,
  screenshots: process.env.PARITY_SHOTS,
});
await server.close();

writeJson(path.join(FIXTURES, "source-baseline.json"), captured);
const interactions = Object.values(captured.functional).flat().length;
console.log(`Captured ${Object.keys(captured.visual).length} programs and ${interactions} interactions`);
process.exit(0);
