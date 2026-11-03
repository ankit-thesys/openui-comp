/**
 * Captures the real open-intelligent-ui app with the parity harness: fingerprints, the controls it
 * uses and, with PARITY_SHOTS, a screenshot of each program on each screen.
 *
 *   PARITY_SOURCE=/path/to/open-intelligent-ui PARITY_OUT=/some/source.json PARITY_SHOTS=/some/folder \
 *     node tests/intelligent-ui/parity/capture-source.ts
 *
 * The checkout must be at the commit in fixtures/SOURCE.json with its dependencies installed.
 * Without PARITY_OUT it records fixtures/source-baseline.json again, which run.ts compares against.
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import {
  captureTarget,
  FIXTURES,
  HARNESS,
  serveHarness,
  SOURCE_MODES,
  writeJson,
} from "./driver.ts";

export async function captureSource(
  source: string,
  options: { out: string; screenshots?: string },
) {
  const pinned = JSON.parse(readFileSync(path.join(FIXTURES, "SOURCE.json"), "utf8")) as {
    commit: string;
  };
  const head = execFileSync("git", ["-C", source, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  if (head !== pinned.commit) throw new Error(`The checkout is at ${head}, not ${pinned.commit}`);

  // The harness runs from inside the checkout, so its imports use the source app's own dependencies.
  const root = path.join(source, ".parity-harness");
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root);
  cpSync(HARNESS, root, { recursive: true });

  const server = await serveHarness(
    root,
    path.join(root, "target.source.ts"),
    path.join(root, "dist"),
  );
  const captured = await captureTarget(server.url, {
    side: "source",
    modes: SOURCE_MODES,
    screenshots: options.screenshots,
  });
  await server.close();
  writeJson(options.out, captured);
  return captured;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const source = process.env["PARITY_SOURCE"];
  if (!source) throw new Error("Set PARITY_SOURCE to a checkout of open-intelligent-ui");
  const out = process.env["PARITY_OUT"] ?? path.join(FIXTURES, "source-baseline.json");
  const captured = await captureSource(source, { out, screenshots: process.env["PARITY_SHOTS"] });
  const interactions = Object.values(captured.functional).flat().length;
  console.log(
    `Captured ${Object.keys(captured.visual).length} programs and ${interactions} interactions`,
  );
  process.exit(0);
}
