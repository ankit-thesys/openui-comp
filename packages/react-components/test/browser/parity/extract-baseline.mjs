// Extracts the package source at the parity baseline revision into test/browser/.baseline/src,
// so build-fixtures.ts can bundle parity fixtures against the pre-migration components.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Head of #72 (codex/react-components-chart-selectors), the last commit before the flat pilot.
export const BASELINE_REV = "5e09b37c04a1a3be05b9447cf8b9effaf33a331f";

const out = fileURLToPath(new URL("../.baseline/", import.meta.url));
const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const archive = execFileSync(
  "git",
  ["-C", repoRoot, "archive", "--format=tar", BASELINE_REV, "packages/react-components/src"],
  { maxBuffer: 64 * 1024 * 1024 },
);
execFileSync("tar", ["-x", "-C", out, "--strip-components=2"], { input: archive });
console.log(`baseline ${BASELINE_REV.slice(0, 8)} extracted to ${out}src`);
