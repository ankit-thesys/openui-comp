// Extracts the package source at the parity baseline revision into test/browser/.baseline/src,
// so build-fixtures.ts can bundle parity fixtures against the pre-migration components.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Head of #72 (codex/react-components-chart-selectors), the last commit before the flat pilot.
// The tag keeps it reachable when that branch is gone; the committed baselines were captured from
// BASELINE_REV, so a tag that moved is an error rather than a new baseline.
export const BASELINE_TAG = "flat-styles-parity-baseline";
export const BASELINE_REV = "5e09b37c04a1a3be05b9447cf8b9effaf33a331f";

const out = fileURLToPath(new URL("../.baseline/", import.meta.url));
const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

let tagged;
try {
  tagged = execFileSync(
    "git",
    ["-C", repoRoot, "rev-parse", "--verify", "--quiet", `refs/tags/${BASELINE_TAG}^{commit}`],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  ).trim();
} catch {
  throw new Error(
    `The parity baseline tag ${BASELINE_TAG} is missing. Fetch it with ` +
      `\`git fetch origin tag ${BASELINE_TAG}\` (CI checks out with fetch-depth: 0, which fetches tags).`,
  );
}
if (tagged !== BASELINE_REV) {
  throw new Error(
    `The parity baseline tag ${BASELINE_TAG} points at ${tagged}, not ${BASELINE_REV}, ` +
      "the commit the committed baselines were captured from.",
  );
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const archive = execFileSync(
  "git",
  ["-C", repoRoot, "archive", "--format=tar", BASELINE_TAG, "packages/react-components/src"],
  { maxBuffer: 64 * 1024 * 1024 },
);
execFileSync("tar", ["-x", "-C", out, "--strip-components=2"], { input: archive });
console.log(`baseline ${BASELINE_TAG} (${BASELINE_REV.slice(0, 8)}) extracted to ${out}src`);
