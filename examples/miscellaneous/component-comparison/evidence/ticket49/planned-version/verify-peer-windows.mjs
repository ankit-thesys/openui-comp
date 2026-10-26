// Publish-time guard for the hand-maintained internal peer windows.
//
// Internal @openuidev/* peerDependencies use bounded ranges (e.g.
// ">=0.3.0 <0.4.0") that changesets never rewrites. This asserts, right before
// `changeset publish`, that every such window contains the workspace sibling's
// current (about-to-be-published or already-published) version — turning a
// stale window into a loud publish failure instead of a broken install for
// consumers. Runs via `pnpm run release:publish`; exits nonzero on violation.
//
// Note: on a pre-first-train working tree the windows are intentionally ahead
// of the manifests, so this is wired into the publish path only — do not add
// it to PR CI.
import { satisfies } from "semver";
import { workspacePackages } from "./workspace-packages.mjs";

const versions = new Map();
const manifests = [];
for (const { manifest } of workspacePackages()) {
  versions.set(manifest.name, manifest.version);
  manifests.push(manifest);
}

const violations = [];
for (const manifest of manifests) {
  for (const [peer, range] of Object.entries(manifest.peerDependencies ?? {})) {
    if (!versions.has(peer) || range.startsWith("workspace:")) continue;
    if (!satisfies(versions.get(peer), range)) {
      violations.push(
        `${manifest.name} peer-requires ${peer} "${range}", but the workspace ` +
          `version is ${versions.get(peer)} — move the peer window before releasing.`,
      );
    }
  }
}

if (violations.length) {
  console.error("Internal peer windows do not match the versions being published:\n");
  for (const v of violations) console.error(`  ✗ ${v}`);
  process.exit(1);
}
console.log("verify-peer-windows: all internal peer windows contain the workspace versions.");
