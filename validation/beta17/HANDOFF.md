# Worker1 → Worker2 fixture contract

Status: RELEASED TO WORKER2 FOR FORMAL MEASUREMENT. Run5 passed 48/48.
Worker1 browser is closed; no builds or competing browsers remain. This is
fixture readiness, not performance/memory acceptance.

Consumer: `/private/tmp/beta17-consumer` (standalone npm installation).
Manifest: `/private/tmp/beta17-consumer/handoff.json`.
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
