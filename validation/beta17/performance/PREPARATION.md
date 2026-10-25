# Preparation validation

This is test-tooling evidence only. It contains no OpenUI benchmark result and
cannot authorize migration, release or closure of #17.

At preparation commit `e46d4540a`, the owned Node test suite passed **25/25**.
That suite includes one real, short-lived local HTTP partial-response abort;
all performance report inputs are explicitly synthetic. Syntax checks passed
for the analyzer, browser driver and runner; Prettier and `git diff --check`
passed. No OpenUI build, browser launch, timing run or memory soak ran.

Independent standards review found cleanup could stop after the first failure.
Both Chrome closes and both CDP detach attempts now use `Promise.allSettled`;
a focused public cleanup test proves server cleanup still runs when the browser
close rejects. The standards recheck reported no remaining actionable findings.

Independent spec review required an independent installed-file inventory,
preserved observed final source, and proof input timing occurred during
streaming. These are implemented and covered by focused tests. The recheck
identified a remaining workspace-symlink provenance gap: public entry resolution
could accept source outside the consumer's installed dependencies. The followup
requires the resolved real entry to lie inside the consumer's real node_modules
and adds a regression test. That test first failed, then passed with the guard.
The focused provenance suite passed **2/2** after the followup. The final spec
recheck confirmed that guard resolves the finding, with no further scoped
preparation blocker identified.

Still pending: Worker1 agreement on `CONTRACT.md`; actual frozen manifests,
archives, installed artifacts and module-origin evidence; explicit browser
window release; a live fixture integration smoke check; complete paired timing
and both ten-minute soaks; independent final evidence verification. Fixture
integration may expose ordinary contract errors that require a reviewed change
and fresh evidence. Preserve failed/partial reports rather than repairing them
into apparent passes.
