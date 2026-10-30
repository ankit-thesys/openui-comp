// One fork-only command: public SSR snapshots, the real client-only contract collection, and
// module provenance for the order report. Raw captures are temporary and never become baselines.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { styleProvenance } from "./style-provenance.mjs";

const record = process.argv.includes("--record");
const serverOnly = process.argv.includes("--server-only");
const capture = mkdtempSync(join(tmpdir(), "openui-css-"));
const cwd = fileURLToPath(new URL("../", import.meta.url));
const run = (args) => {
  const { status } = spawnSync("pnpm", args, {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      OPENUI_CSS_CAPTURE: capture,
      OPENUI_CSS_RECORD: record ? "1" : "0",
    },
  });
  if (status !== 0) throw new Error(`${args.join(" ")} failed (${status})`);
};
try {
  writeFileSync(join(capture, "provenance.json"), JSON.stringify(await styleProvenance()));
  run(["exec", "vitest", "run", "test/unit/css-snapshot.test.tsx"]);
  if (!serverOnly) run(["exec", "playwright", "test", "client-only.contract.spec.ts"]);
  if (record) run(["exec", "prettier", "--write", "test/css-snapshot/*.json"]);
  // Keep reporting at the same TypeScript seam as the tests; no extra runtime dependency.
  run(["exec", "vitest", "run", "test/unit/css-order-report.test.ts"]);
  for (const file of readdirSync(capture).filter((file) => file.endsWith(".md"))) {
    const output = join(
      cwd,
      "test/css-snapshot",
      record ? file : file.replace(".md", ".current.md"),
    );
    writeFileSync(output, readFileSync(join(capture, file)));
    console.log(`Order report: ${output}`);
  }
} finally {
  rmSync(capture, { recursive: true, force: true });
}
