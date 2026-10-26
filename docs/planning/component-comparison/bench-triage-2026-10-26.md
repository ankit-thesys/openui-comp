# Component bench triage — 26 October 2026

Production is read-only. These findings distinguish harness corrections, inherited
behavior and new extraction differences. No production style or runtime patch was
applied. In particular, there is no approved `!important` removal list.

## Preserved diagnostic runs

All three rows use the original 202-case diagnostic scope: 390px, light, plain CSS,
instant delivery. The later runs use corrected, versioned recipes; they are not
silently presented as identical definitions. The complete per-case field changes,
including before/after objects, are in `inventory-changes.json` in each rerun.

| Run | Pass | Fail | Review | Known issue |
| --- | ---: | ---: | ---: | ---: |
| `2026-10-25T21-52-47-119Z-b79d8b85` original | 112 | 53 | 37 | 0 |
| `2026-10-25T23-09-08-951Z-triage202` corrected recipes/order | 113 | 9 | 67 | 13 |
| `2026-10-25T23-12-42-876Z-triage202` equal-origin capture/readiness | 147 | 8 | 4 | 43 |

Original `run.json` SHA-256:
`f936cee9797c0caa037b908e91f42a5bc439fb915bfaf27b8442c455c8ae15ca`.
First corrected SHA-256:
`76dea871711564058ac5df1eac604631438ce69307c1bf8173db7a845bd6affe`.
Equal-origin SHA-256:
`a1d385733898b554daac6fba25a4b349cbb6e1ed04803e711296ed6ef2cf9713`.

The original inventory accidentally reused `image-loading` for Image and
ImageBlock. Their evidence collided, so that run is diagnostic, not certified
coverage. The ImageBlock case is now `image-block-loading`; duplicate IDs refuse
execution. The one original IconButton default case is retained in these exact
202-case reruns even though the expanded catalog combines it into variants.
No diagnostic source strings changed in the first corrected rerun. Changes are
assertions, steps, independent expectations, metadata and the duplicate ID.

The briefly aborted `2026-10-25T23-08-42-535Z-triage202` is retained too. Its
cancellation reason reflected a mistaken reading of compact JavaScript: the
renderer-notice predicate was already correct. The named helper and added tests
are a readability/refactoring guard, not a behavior fix. Do not attribute an
improvement to that predicate.

## Harness causes and corrections

- Moving a host `<link>` after loading can temporarily detach its stylesheet.
  Await actual `link.sheet` registration and real stylesheet order after moving
  it. Never infer that load completion before movement guarantees registration.
- Compare keyboard/focus assertions and captures before interacting with the
  other iframe. Use normal 50ms held keys: Radix schedules roving focus between
  keydown and keyup. Zero-duration `press` focused the next radio after keyup,
  preventing Radix's keydown-tracked selection. Both installed implementations
  select correctly with a held key; this is not a component regression.
- Correct accessible-name selectors for descriptions and image alt text, empty
  state expectations that retain placeholders/structural headings, and table
  skeleton selection. Keep every changed expectation in inventory history.
- Slider `min:40` is optional unless `required` is also specified. The installed
  public `validate` API accepts `undefined`, rejects `[10]` with “Must be at least
  40”, and accepts `[50]`. The invalid-value recipe first presses ArrowRight to
  commit a below-minimum value, then submits. A contract test preserves this.
- The complete form fixture initializes Chips `tags=["chat"]` and OptionCards
  `kit="chat"`; exact submitted payload expectations include those documented
  source defaults and the independently entered name.
- Publish completion only after the evidence manifest exists. The UI test exposed
  a race that previously allowed downloading an incomplete evidence tarball.
  Historical runtime hashes and immutable run IDs are verified explicitly.

Seeded text/style/pixel differences and prohibited requests still fail. Adding an
unexpected assertion failure to an inherited signature remains Fail. Cancellation
retains unfinished Not covered cells. These controls are real browser/HTTP tests.

## Font and screenshot investigation

The first corrected run has zero computed-style or geometry differences, including
`fontFamily`; the earlier font differences do not reproduce after stylesheet
registration is awaited. Isolated diagnostics record the complete stylesheet
origins/rules, matching declarations, theme-variable inheritance, `document.fonts`
state, resource loads and Chrome's actual platform fonts. Default form buttons and
inputs use Helvetica as the installed fallback for the declared `Inter, sans-serif`
in both arms. Naming Inter does not load it. No asynchronous Inter font request is
observed. Unused KaTeX faces can be registered by an asynchronous module without
being used by these controls.

The inherited ThemeProvider does not derive typography shorthand tokens again
when only `fontBody`/`fontLabel` is overridden. Both arms retain that API behavior;
our shared custom presets explicitly set the relevant public shorthand tokens.
This is not evidence of a new core-only font bug.

`triage-raster.mjs` compares unchanged renderers side by side and at identical
screen origin. ImageBlock (3,826 differing pixels), AreaChart (4,129) and Carousel
(766) become exactly equal at the same origin; moving the migrated iframe alone
reproduces the difference. Separate-page repeated captures are also exactly equal.
These are Chromium raster-coordinate effects, not component geometry changes.
The runner now places each iframe at (0,0) **before its interactions**, measures
that actual capture state, restores parent placement afterwards and retains zero
pixel tolerance. It awaits font readiness, real image decode and stable SVG
markup. Explicit held-loading fixtures remain held. Native smooth scrolling is
awaited, not replaced by a component patch. Four previously residual action/icon
cases then yield three Pass and one inherited Known issue, with zero screenshot
reviews (`2026-10-25T23-16-05-932Z-6bd16c54`).

## Confirmed new core styling difference

**Select open-portal shadow** — confirmed in installed artifacts, independently
of side-by-side capture placement. The legacy declaration uses RGBA black for the
second/third shadow layers; `react-ui-core` uses `oklch(0 0 0 / .05)` and
`oklch(0 0 0 / .08)`. Computed `boxShadow` differs. Both arms' repeated captures are
stable (zero self-diff), while their same-origin separate-page cross-diff has
**1,124 pixels** around the shadow. The rest of the measured geometry/styles
match in the minimal reproduction.

Evidence run: `2026-10-25T23-22-04-256Z-0e475508`, case `select-open-portal`,
`isolated-repros/select-open-portal.json` plus original images and cross-arm diff.
The JSON includes native matched-rule data for `[role=listbox]` and actual package
archive identities. Source: installed core `components/Select/select.styles.mjs`.
This remains an unapproved styling failure; no canonicalization, threshold or
baseline update accepts it. Its inherited missing label target remains a separate
Known issue. This is a small shadow difference, not a demonstrated interaction or
performance regression.

## Inherited findings

Exact-signature records cover missing FormControl label targets, click-only
ListItem Enter behavior, DatePicker keyboard/stream-disabled behavior, gallery
keyboard opening, HorizontalBar callback/string-height behavior and source-proven
unnamed controls (Carousel navigation, discrete Slider ValueInput and deliberately
empty labels/triggers). Expected broken references include their exact targets.
Known issue applies only to the matched behavior assertion; any other failure or
new layout/style difference stays Fail. No shared defect is fixed in production.

## Full execution and explicit supplements

The frozen 215-case Default run `2026-10-25T23-16-43-773Z-8bbbd7b0` requests
12,270 cells across all five host environments, three widths, two themes and
compatible instant/stream delivery. It remains in progress at this writing.

Review added three open-overlay cases and replaced programmatic Carousel scrolling
with actual Enter activation plus an independent nonzero `scrollLeft` assertion.
The catalog is now 218 cases / 775 checks. The separate 240-cell supplement
`2026-10-25T23-22-54-703Z-e7138e72` exercises all dimensions for those four recipes;
its changed Carousel version explicitly supersedes that case's older recipe.
The baseline full run is not rewritten. New runner 1.0.1 freezes its checklist at
startup and measures dialog/tooltip descendants as well as popper content.
Final coverage must reconcile this supplement explicitly, not silently add it to
the original inventory or discard non-passing baseline results.

Custom presets have independent focused six-combination consumer/portal checks,
plus separately identified form/select/chart matrix runs. They do not imply the
complete catalog passed under those presets. Final full counts and unresolved
findings will be appended after execution.

### Completed focused/supplemental checks

- Corrected eight-item Carousel recipe guarantees overflow at all approved widths.
  `2026-10-25T23-27-31-347Z-c97250be`: 60/60 native keyboard scroll assertions pass;
  all 60 cells remain Known issue for the two unnamed navigation controls. The
  earlier two-item native recipe could not overflow at tablet/desktop widths; its
  40 failed cells and one screenshot review remain historical harness evidence.
- The 240-cell overlay supplement records 60 Select styling failures, 60 visually
  matching calendar cells with inherited label targets, and 60 passing gallery
  cells, alongside the now-superseded two-item Carousel recipe.
- Cyberpunk form/select/chart focused matrix: 180/180 executed, 56 Pass, 120 Known
  issue, four screenshot Review cells (BarChart,768px,light,Tailwind3,both orders
  and deliveries). The diff is a narrow bar edge. Under the exact historical
  preset/width/host fixture, separate-page old/new captures are stable and equal.
  No core-only cause is confirmed for those four reviews; they remain Review.
- Crimson Desert equivalent matrix: 180/180 executed,60 Pass,120 Known issue,
  zero Fail/Review. Neither focused matrix claims the entire custom-preset catalog.
- Six direct preset/mode consumer/portal checks pass, including an open portal,
  preserved drafts and switching during streaming. Zero API/external requests.
- Original live and offline browser regressions pass after selecting the exact
  theme-mode control (the new preset selector made the old fuzzy label ambiguous).
- Final build/types,28 unit tests and bench UI flow pass. UI checks real child
  execution/history/export/cancellation and saved Cyberpunk/dark identity.
- Frozen historical reproduction
  `2026-10-25T23-24-46-790Z-3d471922` passes its one selected cell and verifies
  original runtime bundle hashes. Coverage-input mutation during execution is
  separately tested and cannot change new runner histories.

Only `carousel-scroll` changed version relative to the original full-run catalog;
three overlay cases were added. `bench/reconcile.mjs` requires exact current case
versions, retains superseded failures explicitly and reports missing cells Not
covered. Its negative test proves an old failed version cannot earn current
coverage, and Known issues cannot turn green. The final reconciliation will cover
12,450 unique current cells using explicitly identified source runs; raw execution
counts include all retained superseded attempts.

The bounded committed archive is
`examples/miscellaneous/component-comparison/evidence/bench/triage-2026-10-26.tar.gz`:
148 selected historical result/raw/reproduction files,5,104,249 bytes,
SHA-256`e2c85c39323531930af69a734163407668735d19e64f71319b1412263024091d`.
It is a selected diagnostic archive, not a complete run export. Complete raw
histories remain in ignored `.bench-runs/`; their original files are preserved.

### Scheduling and sealed-history clarification

The original single-process full run was deliberately stopped after 2,636 executed
cells (2,631 Pass,5 Review,0 Fail). It remains **cancelled**, with9,634 unexecuted
Not covered cells. Its old `summary.complete` meant all outcomes were recorded,
including placeholders; new runner1.0.2 distinguishes `recordedComplete` from actual
execution completeness. No partial run is presented as the full matrix.

The explicit shard plan preserves48 fully covered current case versions, including
the completed supplements, and requests all9,600 remaining cells in four ordinary
CLI processes. Each shard has2,400 requested cells. Case sets are disjoint and
frozen by `.test-results/matrix-shard-plan.json`; all original partial results,
including its26 cells from an incomplete case family, remain retained. This is a
scheduling change, not a reduced matrix. Final reconciliation still requires all
12,450 current-version cells, with matching package/browser/theme/host identities.
Partial-source use must be explicitly enabled and cannot credit placeholders.

The five remaining original chart reviews are BarChart variants at768px under
Tailwind3/4 (29/53 pixels across complete/intermediate captures) and one PieChart
variant pixel. Separate-page installed-artifact repros at the recorded dimensions,
theme and host fixture have zero repeated and cross-arm pixels. They remain Review
because the iframe-only raster difference is not accepted or proven a core defect.

Post-run investigations now live under `.bench-investigations/<source-run>/` rather
than being appended to sealed run directories. Previously appended investigation
files were moved intact; original run JSON, evidence and manifest bytes were not
changed. The committed selected archive retains its original logical layout and
hash. Each new browser/raster investigation receives its own output directory.

### Final independent chart safeguards and inherited-loop measurement

A review control found that chart-variant annotations alone could survive removing
both rendered charts. The runner now independently checks the actual named chart
count, positive-area plotted path/rect marks, and the fixed fixture data labels
Jan/Feb/Mar. These are bounded render/data safeguards, not a claim to certify all
chart mathematics. Arbitrary saved responses do not acquire invented expectations.
The real browser control removes both charts while retaining annotations and must
fail. All300 original chart-variant cells pass the additional audit using their
original native DOM measurements. Original run verdicts are not rewritten; the
separate versioned audit identifies its input run hash and oracle-source hash.

The HorizontalBar root-only height assertion was insufficient: the outer container
stays300px while the inner plot repeatedly cycles through heights0..273px. Native
120-frame traces show the same cycle in both installed implementations, including
changing overflow controls and dependent tick/layout states. The corrected case
measures the actual inner wrapper over120 frames. Its case revision is explicit.

Experiments with special visual-loop classification were **not retained**. The
final runner has no special geometry/width/ARIA matching algorithm, resize freeze,
height override or production workaround. Only the independently measured unstable
behavior receives its exact Known issue signature. Every raw geometry/style/
semantic failure and zero-tolerance screenshot review remains non-passing and
visible. These unstable comparisons are not confirmed core-only regressions and
cannot certify visual parity; an inherited limitation is not an all-green result.
Experimental run histories and source investigation files remain preserved outside
tracked runtime code. The final30-cell corrected measurement run is recorded
separately from those experiments and supersedes the old outer-only case revision.


### Final fixture correction and review boundaries

A generator defect appended variant suffixes to `Icon.name`, creating unknown
glyph identifiers in17 variant families. Canonical icon identifiers are now
preserved. IconButton and Separator variants additionally assert actual rendered
component counts. Two contract tests reproduced the fixture weaknesses before the
fix and pass afterward. The explicit correction plan records18 revised cases
and1,080 full-matrix cells; all four corrective shards completed. Earlier recipe
versions and their evidence remain retained and cannot credit current versions.

The full matrix has executed12,450 current-version cells. This is coverage, not an
unconditional parity pass. Select portal shadow differences are confirmed new-core
styling differences. The inherited HorizontalBar inner-height loop prevents stable
visual comparisons. Other zero-tolerance image reviews remain unresolved, including
small image/tag/card raster differences and Slider validation-state captures.
They have not been accepted as baselines or normalized away.

The code-copy case also exposed a browser harness focus failure: Clipboard API
writes require the document to have focus. The harness now uses Playwright's
standard `page.bringToFront()` and the iframe's `window.focus()` before the native
clipboard operation. No clipboard shim or production workaround is introduced.
The original60 focus failures remain recorded; the isolated60-cell rerun is
reported separately in final reconciliation.


### Final reconciled result and browser release

Final reconciliation executed **12,450/12,450 current cells**, missing0:
9,151 Pass;86 Fail;31 Review;3,182 Known issue. Aggregate **Fail**.
The clipboard rerun `2026-10-26T07-40-15-403Z-689a754a` passes60/60;
its original60 focus failures remain retained as same-version prior findings.
The reconciliation also indexes1,170 superseded-recipe results.

Current Fail cells are60 Select portal shadow differences and26 unstable inherited
HorizontalBar comparisons. Reviews are4 HorizontalBar,4 BarChart,1 PieChart,
2 Tag,7 ImageText,5 CompositeCardBlock and8 Slider validation captures. Remaining
raster reviews are unresolved, not newly confirmed core regressions or accepted
baselines. Full current-version execution does not imply all assertions passed.

Final unit suite34/34 and example build/types pass. The browser is **released**
to the verifier; no further bench browser work is scheduled during its window.
Handoff `/private/tmp/worker1-bench-handoff.json` preserves exact fixture v2,
package and621-file implementation source identities. Final durable compressed
results and source-run hashes are in the example's `evidence/bench/final/`.
Production packages and frozen artifacts remain unchanged.
