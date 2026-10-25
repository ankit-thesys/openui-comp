# V2 preflight passed; formal runner blocked before browser launch

Handoff SHA256: `d222d61713a8854a93144dc870d514a536015ba40be5735e3fd72e213f1f1895`.
All 6,688 supplied frozen hashes matched. With semantic `main [role="form"]`
expectation, the strengthened preflight passed **8/8** workload/load/arm cases,
including active cancellation, cleanup, changed streaming input and visible
bars. The harness is frozen at `f2aad47ac`, with **27/27** owned tests passing
and both source review axes reporting no actionable issue.

The first formal command failed its existing immutable-input guard before
creating a result directory or launching a browser. Every one of the 2,128
listed `runtimeModules` paths is absent from `handoff-v2.json.inputs`. This
includes parser/core/kit and nested third-party modules. Canonical realpaths do
not resolve the mismatch. The separate `installed-proof.json` records hashes
for four package archives' installed files, but that proof itself is not an
entry in the handoff's frozen inventory, and its top-level input map does not
cover the compiled module paths. It does not satisfy the existing direct-path
guard without a changed contract.

`v2-provenance-blocker.json` preserves every missing path. Do not bypass the
guard or mutate V2. Worker1 should add verified runtime-module hashes to a new
immutable manifest, audit the other declared inputs and refreeze/release. No
product/client/server/served asset or payload change is needed for this issue.

**Zero formal samples and zero formal soaks ran.** All preflight browsers were
closed. Worker2 explicitly releases the quiet window and server back to Worker1;
Worker1 owns server stop. V1 failure and V2 successful preflight remain preserved.
