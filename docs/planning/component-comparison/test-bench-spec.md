# Component parity and regression bench

Status: approved for implementation by the user on 2026-10-26 after a fourteen-question design interview and final confirmation.

## Goal and ownership

Evolve the existing comparison lab into a repeatable component/state parity and
regression bench, with automated runs and manual investigation. Full chat journeys
come later. One worker owns implementation; do not spawn or delegate to other agents.

Work on codex/component-comparison in
/Users/ankitdas/.codex/worktrees/component-comparison/openui and update draft PR41
in ankit-thesys/openui-comp. Own examples/miscellaneous/component-comparison and
docs/planning/component-comparison only. Necessary example-local dependencies and
lockfile changes are allowed. Keep production PR42, production packages, main,
other worktrees, friend directories and historical beta evidence unchanged.
Never push upstream, merge, publish, release, or close migration issues.

## Approved experience

- Searchable component/case list with coverage and results on the left.
- Isolated legacy/new renderer panes in the center, equal viewport dimensions.
- Details panel for per-layer differences, action payloads, evidence and exact
  reproduction steps. Preserve manual exploration and shared theme controls.
- Run selected, Run all and rerun failures. Clearly label Quick versus Full,
  progress, pending/running/completed/cancelled cases and actual executed coverage.
- Preserve Live AI and Offline demo experiences. Live AI is exploratory: a
  response becomes eligible for an official run only after an explicit save as a
  deterministic case. Saving must not invent expected assertions or mark coverage.
- Local developer UI and command-line runner share the same cases, execution
  engine, result schema and verdict rules. No hosted service/accounts or automatic
  PR blocking in this milestone.

## Inventory and case contract

Use both generated library registries as the authority. Currently they share 84
names: 80 reachable through the Card response, plus Label, Slice, SwitchGroup and
SwitchItem in explicitly labeled direct examples. Preserve these distinctions.
Slice and standalone SwitchItem render no UI by design; never fabricate visible
examples. Exercise nested behavior through valid parents where applicable.

Create an explicit per-component checklist for applicable public variants,
empty/loading/error/disabled states, keyboard/focus behavior and action payloads.
Track an assertion and evidence for each covered item; parser-tree presence alone
is not behavior coverage. Tabs, accordions and carousels require interactions to
exercise hidden content. Use bounded accessibility semantics/keyboard checks and
do not claim full accessibility certification.

Each saved case must identify its component coverage, valid input, setup,
interaction steps, independent expected behavior/assertions, delivery modes,
environment applicability and known issues. Include negative/empty cases where
supported; mark genuinely unsupported states Not applicable with a reason.
Unimplemented or unexecuted checks are Not covered, never Pass. Matching a broken
legacy implementation is not sufficient evidence of correct behavior.

## Official execution matrix

- Pin an exact Chrome for Testing version/binary and record its identity. Initial
  verified binary is Chrome for Testing156.0.8078.47; verify availability/provenance
  before use. Firefox and Safari are future scope.
- Three viewport widths: mobile, tablet and desktop. Implementation defaults are
  390,768 and1280 CSS px per renderer viewport. Record width,height,DPR and browser
  mode; compare identical renderer sizes, independent of surrounding bench layout.
- Light and dark themes.
- Quick runs use plain CSS. Full runs use plain CSS plus Tailwind3 and Tailwind4,
  each with host stylesheet before and after component styles (five environments).
  Use genuine pinned built Tailwind fixtures, not handwritten substitutes. Keep
  dependencies/config/assets local to the example; record actual stylesheet order.
- Every compatible case runs instantly and via deterministic local streaming.
  Compare at explicit intermediate chunk checkpoints and completed output; freeze
  chunk schedule/seed and record it. The four direct examples remain non-streamed.
- Shared behavior cases cover Stop, Replay, mode switching/cancellation, stale
  event fencing, independent drafts and action submission. Offline interactions
  log originating pane and exact values without network generation.
- Official cases require no credentials and no API/external-service requests.
  Local static assets are allowed. Block/count prohibited requests and fail on
  violations. Never contact the paid live endpoint while running the matrix.

## Comparison and verdict rules

Report separately for each layer:
1. Behavior and exact action payloads, including independently specified expected
   outcomes, event counts, state changes and cleanup.
2. Text and accessibility semantics.
3. Layout geometry and computed styles.
4. Screenshots and visible diff evidence.

Fail unapproved layout/style differences. Surface screenshot differences for
explicit review; pixel comparison must not hide functional failures. Normalize
only documented nondeterminism (e.g. generated IDs or controlled animation timing),
with a narrow recorded rule. No broad ignore lists, automatic baseline acceptance,
threshold loosening to make failures green, or normalization of real UI defects.

Support Pass, Fail, Known issue, Not covered, Not applicable, and an unresolved
review state where appropriate. A run with failures, pending review, known issues
or uncovered requested cases must not display an unqualified all-green verdict.
Cancellation and infrastructure errors cannot become passes. Retain raw failures.

Known issues must be explicit scoped records with reproduction details and affected
cases/environments. Reproducing the same known legacy bug in both arms yields Known
issue, never Pass. Unexpected behavior beyond that issue's defined signature is a
new failure. Keep the inherited HorizontalBar string-height/legend-fit resize loop
disclosed; do not repair production behavior or bypass it in the lab.

## Reproducibility, history and exports

Persist local run history outside tracked source. Each immutable run captures case
inputs/versions, expected assertions, runner version, exact package versions and
artifact hashes, browser/environment identity, CSS order, chunk schedule, logs,
results, screenshots/diffs and reproduction commands. Historical reports retain
their original identities rather than acquiring current package metadata.

Export a human-readable HTML report plus machine-readable JSON and its referenced
evidence bundle. Reports must be usable offline and identify missing artifacts or
incomplete runs. Escape case/source/action text when rendering HTML; do not execute
fixture content in reports. Never include environment files, credentials, auth
headers or secrets. Explicitly saved live responses may contain user data: include
only the selected case and its necessary evidence, not unrelated conversations.

## Implementation and checks

Preserve the frame origin/source/revision guards, server-only key handling,
production package boundaries and existing working live flow. Use ordinary public
component/styling/browser APIs; no runtime patches or schema/export changes.
Maintain local assets and separate document styles. Keep performance acceptance
and SSR outside this bench's claims.

Build in cohesive stages: case/result schemas and coverage ledger; shared runner
and environment fixtures; comparisons and history/export; UI; full matrix and
failure investigation. Use meaningful behavioral tests, including deliberate
mismatches, known-issue classification, incomplete/cancelled runs, export escaping,
replay/cancellation and prohibited network detection. A seeded failure must be
detectable in its correct result layer. Do not replace real execution with counts
or static mocks and claim coverage.

Run type/build checks, focused tests, and the approved actual browser matrix.
Report uncovered cells explicitly and work toward the complete approved scope;
do not silently reduce scope to a small representative suite. If an external or
inherited limitation blocks a cell, capture the concrete evidence and explain it.
Do not modify production code to resolve lab findings.

## Handoff

### User-directed priority: trustworthy failure triage

Fix harness selectors, oracles and fixture contamination with targeted regression
checks; preserve the initial 202-case smoke evidence. Rerun that same
390px/light/plain-CSS/instant scope before broadening coverage. Record changes to
case definitions and inventories explicitly. Investigate remaining font-family
and screenshot differences through actual module/style origins, provider variables,
font/image readiness, inheritance, winning declarations and animation state.
Inspect images and diffs; do not mask differences with permissive thresholds or
automatic baseline updates. Confirm core-only defects in minimal isolated old/new
installed-artifact reproductions. Keep exact inherited defect signatures as Known
issue, never Pass; additional differences in those cases remain failures. Report
harness corrections, shared defects, confirmed new regressions and unresolved
differences separately with raw evidence and source/artifact identity. Production
changes are outside this triage; retain the harness changes and evidence in PR41.

### Approved addition: shared custom-theme presets

Add a shared theme-preset selector with Default, Cyberpunk and Crimson Desert,
alongside the existing shared light/dark mode. Apply identical public ThemeProvider
overrides to both isolated panes, including portals and the four direct examples.
Cyberpunk uses dark/navy surfaces and cyan/magenta accents; Crimson Desert uses
sand, crimson, burnt orange and brown. Both have light/dark variants. These are
lab-only test palettes, never production defaults or CSS overrides on components.

Use one serializable preset definition shared by both pane adapters. Coordinate
exact fixtures with the theme/cascade verifier so manual lab viewing and independent
wiring checks use the same versioned token values. Preserve supported public APIs;
do not invent theme fields. Include distinguishable supported non-color tokens.
Switch presets without resetting conversation, replay position or unfinished form
inputs. Keep live/offline, instant/streaming and direct-example paths working.

Record preset ID, mode and token-definition hash in saved cases, runs and exports;
historical results must retain their original theme definition. Preserve the existing
Default suite coverage; custom-preset runs are separately selectable and reported,
never counted as passed before execution. Verify actual computed token consumers
and portal styles in both panes, not only selector labels or screenshots. Missing
theme wiring must fail even when a fallback visually resembles the expected theme.
No new API calls are needed to test switching. Include focused browser coverage for
all three presets in both modes, switching during a stream, independent drafts and
an open portal. Preserve production PR42 and other worker ownership.

Update consumer README, validation notes and the lab PR description around the
final behavior. Commit and push owned files to the existing fork branch/PR41;
do not create a duplicate PR. Check/fix relevant CI conventionally. Leave the lab
runnable and report commit, URL, matrix coverage, actual results, limitations and
reproduction/export instructions. Preserve existing evidence and production PR42.
