# Chrome for Testing lifecycle readiness — passed diagnostic, not acceptance

The final whole-bundle-guarded replay completed **8 excluded first streams and
80 diagnostic observations**, ten alternating pairs in each chat/dashboard ×
paced/stress cell. All four cells reached their ends and all eight browser
instances shut down cleanly. Observed browser-close durations were63–114ms.
No GoogleUpdater message appeared in the browser-process log, and no error was
recorded. Before/after frozen input and installed-package checks passed.

The actual runner preflight then passed **8/8** cases, including four live-stream
cancellations, rendered correctness, CDP memory/process sampling and zero active
streams/timers at terminal checkpoints. The final owned Node suite passed
**34/34**, including meaningful executable/framework tamper and symlink/inventory
rejection tests. The framework/unfrozen-file tests failed before their guard was
added and passed afterward. Syntax, formatting and whitespace checks passed.

`cft-readiness-summary.json` contains the machine-readable lifecycle facts.
`cft-browser.json` contains the exact version, platform, executable path/hash,
official source, measured archive hash, metadata hash and whole-bundle identity.
The official ZIP matches all340 extracted regular files and five symlink targets
(`cft-archive-proof.json`). The bundle inventory is retained separately for W1
to merge into its immutable `inputs` map. No vendor-published checksum is claimed.

The conventional harness/environment delta is confined to `browser-config.mjs`,
`browser.mjs`, `run.mjs`, focused tests and performance documentation/evidence.
It uses stock Playwright executablePath launch, verifies runtime version for
every arm, explicitly closes contexts before browsers, and hashes the complete
app bundle before launches and after execution. It adds no browser flags,
updater controls, detached streams, process-kill hooks or runtime patches. Both
arms use the same isolated official Chrome156.0.8078.47 mac-arm64 build. The user’s
installed Chrome/updater and W1's fixture/product inputs remain unchanged.

## Independent review

**Standards:** the whole-bundle provenance finding is resolved; no remaining
actionable findings. Review was source-only and ran no browser or tests.

**Spec:** the exact file/link inventory and terminal revalidation resolve the
provenance finding; no further actionable scoped issue. Review explicitly does
not grant formal acceptance.

## Evidence and release

`cft-interim-diagnostic.tgz` preserves the earlier complete pinned-browser replay
with executable-only provenance. It remains interim. `cft-guarded-diagnostic.tgz`
preserves the final whole-bundle derived manifest, exact instrumented runner,
raw reports, full API/browser lifecycle log and eight-case preflight. Only added
lifecycle logging and a diagnostic-only report marker distinguish the diagnostic
copy from the owned runner. Logs and sources are preserved verbatim in archives;
checksums are in `CFT-ARCHIVES.sha256`. The Chrome binary/ZIP stays under the
isolated `/private/tmp/beta17-cft/` path and is not added to the Git repository.

**This is a successful lifecycle/fixture diagnostic, not the formal80-sample
acceptance matrix. Neither ten-minute soak has run.** Do not reuse diagnostic
observations or interrupted V3/V4 samples for formal acceptance. It does not
resolve the disclosed baseline typecheck/default HorizontalBar gaps or authorize
migration, publication, deprecation, or issue closure.

Root/W1 can now refreeze the exact browser and harness inputs following
`CFT-HANDOFF.md`, validate the full prerequisites and explicitly release for a
fresh formal matrix and both ten-minute soaks. All owned Chrome/Node diagnostics
and preflight processes are closed. The browser/quiet timing window and fixture
server are **explicitly released back to root/W1**; W1 owns server stop.
