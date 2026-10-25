# Worker1 → Worker2 fixture contract

Status: V3 RELEASED TO WORKER2 FOR FORMAL MEASUREMENT.
Complete startup/inventory readiness and exact W2 browser8 preflight pass.
The prior48 functional gate is unchanged; no served/product/replay changes.
W1 browser is closed; server48419 remains unchanged/live4197.
V1/V2 releases are superseded. No timing, soak or performance acceptance yet.

Consumer: `/private/tmp/beta17-consumer` (standalone npm installation).
Manifest: `/private/tmp/beta17-consumer/handoff-v3.json`.
SHA256: `8d3f583e17dd4b5e12d24b5aacb7d5dabdd4dd7c09a1de8299a08195059e0b14`.
Proof: `/private/tmp/beta17-consumer/installed-proof.json` (v3).
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
