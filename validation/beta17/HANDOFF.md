# Worker1 → Worker2 fixture contract

Status: V4 RELEASED FOR A FRESH FORMAL RUN.
Complete readiness passes8 browsercells/10516inputs/2128declared modules.
Bounded transition passes: opened4, closed4, nextCellReached=true; frozen input
and installed inventories unchanged after it. W1 browser CLOSED.
Keep server48419 unchanged/live4197. V3's20 samples are interrupted evidence,
excluded from fresh80 measurements and both soaks. No performance verdict yet.

Consumer: `/private/tmp/beta17-consumer` (standalone npm installation).
Manifest: `/private/tmp/beta17-consumer/handoff-v4.json`.
SHA256: `7de0f135e2d41b5f715c1c00e775fa507291baf1c5df41f3b36bc2342b7c1581`.
Proof: `/private/tmp/beta17-consumer/installed-proof.json` (v4).
Fixture server: `BETA17_DIST=/private/tmp/beta17-consumer/replay-dist node validation/beta17/fixtures/server.mjs`.
Origin: `http://127.0.0.1:4197`.
Worker1 owns server start/stop and the first functional browser window.

The contract follows Worker2's performance/CONTRACT.md: four cells, ordinary
controls (theme hue is numeric degrees mapped through the existing ThemeProvider
color override to `hsl(hue 70% 45%)`), exact source output, required rendered text/counts, installed module
origins, session-specific transport counters and frozen input hashes. Dashboard
cells include painted bar counts and forms as well as tables. Payload sizes are
2/6 repeated text/table blocks; dashboard adds one three-bar chart per block.
Both workloads add the same contact form and follow-up action. Replay uses exact
UTF-8 bytes at paced 40 ms/512 bytes and stress 0 ms/64 bytes.

Scope is the extracted public chat component library through actual Renderer
and its streaming parser with real HTTP delivery. This does not include the
unported AgentInterface, OpenUIChat shell or deferred helper package. The fixture
owns ordinary React response state; `#message-source` displays that response
passed to Renderer. Do not label it headless chat-store integration.

No changes to payloads, server/client/build files, consumer lock or served output
after formal release. Runtime source and baseline do not share product imports;
compiled module-origin guards reject source/workspace resolution and arm mixing.
Installed files byte-match frozen archives. Original legacy source is unchanged;
its private copy used standard package build/CSS checks and pnpm pack with
lifecycle scripts disabled only for packing already-built output.

Run2 remains provisional. Run3 passes 48 cells but review found missing visible
partial rendering, actual stylesheet-order assertions and handoff chart counts.
Run4 adds those checks, direct server cancellation counters and active-unmount
cleanup. Run5 aligns the numeric hue contract and passes 48/48 with all checks.
Exact final runner, immutable inputs, manifest, proof and raw logs are archived
under functional/evidence. Both scoped review axes report no remaining blocker.
No old result is recast as accepted.

Runtime fixture strict TypeScript check passes. The baseline strict consumer check
finds an existing react-headless declaration reference to missing `eve/client`.
This is retained in baseline-types.log.gz; no legacy patch or skipLibCheck was
used to disguise it. Both standard browser builds and all functional cases pass.
Do not claim baseline strict types or unconditional beta readiness.

The original standard baseline build exits successfully using its existing
build:tsc command, which permits diagnostics. Missing headless declaration
diagnostics in that private build are preserved in baseline-build.log.gz; it is
not represented as a clean legacy typecheck. Frozen server is now running in
owned exec session 48419 at port4197; W1 will stop it after W2 releases it.

## V2 contract correction — verified and released

Both public FormRenderer implementations render `div role="form"`. V1 expected
`main form`; Worker2 correctly observed zero native forms. The new shared
assertion reproduced that mismatch before correcting metadata to
`main [role="form"]`. Every manifest count and required text is now asserted on
both arms/all cells. Empty required submission must show validation and emit no
action before valid Ada submission can pass. No wrapper is fabricated.

Original handoff-v1.json and installed-proof-v1.json are preserved in the normal
consumer. Corrected handoff-v2.json records the original hash and correction.
Only test metadata/helpers changed; served assets, client, server, replay
payloads and installed packages remain unchanged. No formal timings/soaks ran.

The final correction gate passes48/48 and directly verifies EVERY manifest DOM
probe and required text. Exact W2 preflight completes8/8 with errors=[]; source
snapshots, raw results, original/v2 metadata and integrity proof are retained
under functional/evidence/form-contract-v2. The only changed v1 input is the
build script's metadata selector; all previously hashed served output, replay
and installed-product modules are unchanged. W1 releases its browser window.
Root coordinates W2's formal timing/soak start. Do not use v1 for measurement.

## V3 complete provenance readiness

V2 passed browser preflight but formal startup stopped before Chrome because
2128 declared module paths lacked exact keys in inputs. Preserve that stopped
attempt and v2 metadata. V3 includes every declared path and canonical file hash,
package owner/lock identity (3801 records across both arms), raw product archives,
archive verification proof and prior manifest/proof. Paths escaping the consumer
or mismatching lock versions are rejected. Canonical alias and rejection tests
pass2/2; initial alias failure remains recorded.

Complete readiness follows W2 checklist f8b961043: schema/all four cells/exact
payload schedules, exact module input keys and10513 real file hashes, actual W2
installedInventory, one lockfile, tools/output writability, then actual W2
preflight8cells with painted bars, streaming input changes, cancellation, CSSOM,
CDP/RSS and unchanged before/after inventories. All pass; both reviews report no
blockers. Raw results, executed runner snapshots and exact four archives are
retained in functional/evidence/module-contract-v3. No unchanged48 rerun or
formal timing was substituted for this check. Root may restart W2 exclusively
using V3. Keep server48419 unchanged; no competing build/browser/heavy tests.

## V4 cleanup-only runner handoff

W2 commit739b4af6b preserves V3's interrupted20/80 report, rejects incomplete
acceptance and sequences Playwright client closure before its owning server.
The only changed existing V3 input is performance/browser.mjs, reviewed SHA256
331708aff3da94f867e2798cb87fb4a577ee14a815616a378cc2796debe242b7.
V4 adds immutable V3 manifest/proof and a bounded transition correctness script.
No product, package, client/server, payload, schedule or served asset changed.

Complete readiness passes8cells and all10516 input hashes. Actual W2 APIs open
both arms, finish/unmount them, close both with the formal runner's cross-host
cleanup pattern, then reach the next workload cell. Transition passes4opened/
4closed/nextCellReached=true, with unchanged post-input+installed inventories.
Both review axes report no blockers. Exact scripts, raw results and interrupted
V3 evidence are retained under functional/evidence/cleanup-contract-v4. The
unchanged48 functional matrix was not repeated. Root may now restart a FRESH80
benchmark followed by both ten-minute soaks; V3's20 samples cannot be reused.
