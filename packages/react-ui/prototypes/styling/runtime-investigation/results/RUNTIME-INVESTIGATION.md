# Runtime Goober investigation — decision remains reopened

Neither runtime nor static is accepted. This focused runtime candidate demonstrates automatic base styling and SSR, but **fails ordinary consumer overrides and Button hover behavior**. No migration implementation tickets should be created from a passing performance number.

## What was actually tested

Actual OpenUI Button/Input/Card/header/form/markdown/Table/D3-chart components, the production library/Renderer/incremental parser, and the headless SSE adapter. Nine component style units plus a resolved-theme resource compile descriptor objects through Goober **during rendering**. Descriptors were generated once from selected production Sass for this spike. This is a representative prototype, not a full hand-authored migration.

The adapter uses private compilation targets and React 19 style resources. That automatic delivery is OpenUI-owned integration, not stock Goober SSR. Consumer runtime fixtures import components without component CSS imports, setup, a styling-only provider or a custom consumer build plugin. Production Next uses a library prebundle to share React/select universal dependencies; it is not a fresh npm-tarball install test. The original package CSS is linked only by the baseline.

## Results

| Requirement | Outcome |
| --- | --- |
| Standalone import/render | Pass: actual Button styles in CSR, no-JS SSR and hydration without ThemeProvider; click works |
| Imported but not rendered | Pass in the standalone fixture: zero emitted style tags |
| Actual streaming output | Pass: 20 measured chat/dashboard runs plus four warmups; final content and sampled resting styles match |
| Next SSR/hydration/streamed styles | Pass for the corrected base-style candidate, including a newly revealed Table and no hydration errors |
| Themes and concurrent requests | Pass for tested blue/red themes and eight concurrent no-JS documents; not arbitrary themes or nested/dark/portal certification |
| Bounded SSR pressure | 100 responses at concurrency 10 (50 per arm), plus six abort canaries followed by server-health check; not capacity or per-request leak proof |
| Host Goober preservation | Pass for the separate host target fixture |
| Plain CSS / Tailwind v3 / Tailwind v4 overrides | **Fail in all three**: added component selector specificity defeats ordinary consumer classes |
| Hover parity | **Fail**: chained pseudo-selector translation changes the existing Button hover behavior |
| Portal styles and broad support | Unavailable/unsupported in this scoped prototype; chart tooltip portals escape its scope |

## Bundle and usage evidence

Component-only ESM bundles externalize React. Baseline Button: 3968 bytes gzip JavaScript. Runtime Button: 6728 bytes gzip JavaScript (+2760 bytes). The runtime entry includes the Goober engine, descriptor and adapter, with no chart or assembled-library code. The unused import drops to 51 raw bytes of a test marker. **These JavaScript numbers exclude baseline CSS and are not total network-cost comparisons.**

The real streaming fixture deliberately includes the full OpenUI library; it is not evidence of full-library tree shaking. Runtime style emission and JavaScript removal were tested separately. Public root-barrel exports, lazy route transfers and published-package installs need their own audit.

## Exploratory streaming timings

Five alternating measured pairs per workload, fresh browser contexts, three response blocks/dashboard panels, fixed 128-character SSE chunks at 60/s, scripted typing and two-frame update proxies. Both arms share the instrumented harness bundle, so this isolates execution during streaming, not cold download/startup. Builds and SSR pressure were stopped before timing. Total durations include timer/frame scheduling.

| Workload | Baseline total median ms | Runtime total median ms | Median paired total change | Runtime Goober adapter time median ms |
| --- | ---: | ---: | ---: | ---: |
| chat | 299.3 | 331.8 | 0.2% | 2.4 |
| dashboard | 498.9 | 500.0 | 1.2% | 5.4 |

Paired total-change ranges: chat -4.5% to 11.3%; dashboard -5.7% to 7.8%. The difference between medians and paired changes shows scheduling noise; five pairs are insufficient for a strong latency claim. No large repeatable runtime slowdown is established here, and there is no overall performance approval while correctness gates fail. Adapter timing is instrumentation, not total rendering overhead. This round did not execute a runtime memory soak or a heavy stress ladder. The earlier static twenty-minute soak does not apply to runtime.

## Why the attempts failed

The first selector adaptation increased specificity and lacked complete SSR tokens. An attempted `:where(&)` correction was translated by Goober into a descendant selector, leaving components unstyled; apparent framework-override passes in that attempt were false positives. Those raw results and source snapshots are retained. The final candidate restores matching scoped selectors, adds per-token default fallbacks for standalone components, and emits resolved-theme resources for custom SSR themes. Base styles recover, while higher specificity and a compound `:not(...):hover` translation defect remain visible.

These findings constrain this descriptor conversion/adapter, not every possible runtime Goober design. Deliberately authored selectors or another delivery/cascade strategy might address them. Any fix needs repeatable parity and override tests; do not use blanket `!important` or secretly reintroduce manual consumer setup. Dynamic theme values may also grow the process-wide Goober compiler cache; the bounded red/blue tests do not establish its long-term memory behavior.

## Comparison and next review

Preserve the static results at `4092ca6c` and `faec2290`. They validate the static route that was tested, not runtime speed or suitability. Component-level static CSS imports remain another possible install-and-import route; they were not evaluated here and do not inherently require a custom scanner.

The next decision is whether to investigate a narrowly defined runtime selector/cascade repair or compare component-level static imports before choosing. Neither outcome is preselected. Package boundaries, all charts in core, chat component/library split, helper-package ownership and AgentInterface exclusion remain unchanged.

[Browser raw results](browser.json) · [Next report](next-runtime.md) · [Next raw results](next-runtime.json) · [Bundle audit](bundle.json) · [Summary/source hashes](runtime-summary.json) · [Failed :where attempt](next-where-failed.json)

No production components or static measurement files were modified.
