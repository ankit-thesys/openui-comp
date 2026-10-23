# Runtime Goober: detailed investigation

**Decision remains reopened. Neither runtime nor static is accepted.** The deeper run fixes the earlier selector defect and supports automatic runtime styling in the tested React 19/Chrome paths. It also identifies concrete CSS customization and cache-lifetime work before migration can be approved.

## What runtime means here

Goober executes while rendering actual OpenUI components. A library-owned adapter uses private stylesheet targets and React 19 stylesheet resources so that styles travel with the rendered component, including SSR and delayed streamed content. Consumers in this fixture import components without a component CSS import, setup command, stylesheet scanner or consumer build plugin.

Static generation performs the CSS computation before deployment and then needs a stylesheet-loading contract. JavaScript tree shaking is separate in either design. Earlier successful static results remain unchanged under `../runtime-investigation` references and the original static prototype; they neither prove nor disprove runtime performance.

This prototype uses nine actual component units: Card, Button, Input, CardHeader, Buttons, FormControl, TextContent, Table and BarChart, with their supporting selected styles. The production OpenUI Renderer/parser and headless SSE adapter are used. It does not port every component or run the complete AgentInterface/chat shell with runtime styles. The old full-shell and twenty-minute results tested static CSS and must not be transferred to this candidate.

## Correctness and integration

| Area | Observed result |
|---|---|
| Selector conversion | All 293 selected selectors preserve count, specificity and one generated scope class; browser state checks validate the representative Button path. |
| Standalone import | Runtime Button works with no ThemeProvider in CSR, no-JavaScript SSR and hydration. Import without render emits no styles. |
| Existing component appearance | Normal, hover, active, disabled and focus states match original Button, including untouched styles under plain CSS, Tailwind 3 preflight and Tailwind 4. |
| Ordinary customization | Plain CSS and Tailwind 3 normal/late overrides pass. Tailwind 4 utility overrides fail in both baseline and runtime. Ordinary hover background overrides also fail in both arms. |
| Streaming/hydration | Tested themes, forms, navigation, late Table/first-visible styling and separate transport chunks pass with no hydration errors. |
| Concurrent SSR | Eight concurrent no-JavaScript theme pages and 100 responses at concurrency 10 pass; server stays healthy after six response aborts. These are bounded diagnostics, not capacity or exhaustive cancellation proof. |
| Theme defaults | Runtime custom-theme SSR passes. Original custom ThemeProvider SSR has a separate baseline limitation; it is not counted as a runtime regression. |

The first runtime conversion added specificity and Goober's flat selector serialization broke chained functional pseudo selectors. This round authors nested Goober objects from a selector AST and zeroes one original class with `:where()` to offset the generated scope class. It does not rewrite emitted CSS or use blanket important declarations. Failed variants remain in `runtime/CANDIDATE-HISTORY.md` and their raw results. This is library-owned conversion complexity, not proof that every Sass selector is supported.

The Next checker initially included newly added unthemed standalone probes in its themed late-content observer. That false failure and the corrected observer result are preserved separately. `next-executed-artifacts.json` records the exact executed checker and built artifacts; no production rebuild was needed for the observer-only correction. The 127 checks overlap and are not an acceptance percentage.

## Layer diagnostic: why one blanket fix is insufficient

A separate browser-only diagnostic wraps emitted runtime rules in a component layer; it does not change the candidate or its consumer path. Without declaring layer order first, both Tailwind 3 and Tailwind 4 can lose their untouched component defaults. Declaring the standard `theme, base, components, utilities` order first fixes Tailwind 4 defaults and utility overrides. Tailwind 3 still becomes transparent/black with zero padding because its unlayered preflight outranks every named layer. Plain CSS works in these sampled cases.

This isolates CSS cascade behavior from Goober selector serialization. The ordered-layer rewrite is diagnostic evidence, not an automatic integration implementation or accepted requirement. See [before/after samples and hashes](layer-diagnostic.json).

## Browser performance

Eighty measured runs: ten alternating baseline/runtime pairs for each workload/load, plus eight excluded warmup runs. Fresh Chrome contexts, matching source and replay schedule, typing during streaming. Normal is three blocks at 60  chunks/s and 128 characters/chunk; pressure is twelve blocks at 120  chunks/s and 64 characters/chunk. These rates describe this deterministic replay, not token throughput or a production service target.

| Workload | Paired median total-time change | Median runtime Goober/adapter time per replay |
|---|---:|---:|
| Normal chat | −0.09% | 3.1 ms |
| Normal dashboard | +0.16% | 6.5 ms |
| Pressure chat | −0.27% | 17.0 ms |
| Pressure dashboard | +0.25% | 48.1 ms |

No material total-time regression was observed in this bounded local run. Small apparent gains are noise, not proven speedups. Individual normal-chat paired differences ranged approximately −10.4% to +11.2%, showing why the median should not be overinterpreted. Pressure dashboard ranges −1.38% to +1.54%. All runs pass final content and sampled resting-style parity; no long tasks were recorded in either arm. Input/update measurements are frame-based proxies, not direct React commit measurements. Normal-chat update-p95 median was 36.2 ms baseline versus 43.4 ms runtime; other cell medians were similar. Intentional replay pacing dominates total duration and can hide CPU overhead under heavier workloads.

The shared workload bundle contains both arms, so this measures execution during streaming, not a cold-load network comparison. The large runtime dashboard emits 11 style tags totaling87,854 text bytes; the small dashboard emits the same distinct resources. This demonstrates deduplication for the selected finite styles, not bounded lifetime for arbitrary dynamic styles.

## Bundle contents

Dedicated Button entry, minified ESM with React external:

- Baseline JavaScript: 3,968 gzip bytes.
- Runtime JavaScript: 6,770 gzip bytes, an increase of 2,802 bytes.
- No chart/Table/assembled-library code is retained in this Button entry.
- An unused Button import becomes a 51-byte raw marker module with no Goober engine.

Baseline CSS, React, transfer headers and caching are excluded. This is not a whole-package/root-barrel or source-registry tree-shaking certification. The full workload fixture imports the existing assembled chat library intentionally.

## Memory: an important distinction

Four fresh server processes completed 8,000 measured actual streaming SSR renders plus 160 warmups in 24.61 seconds. Each arm/theme regime renders 1,000 chat and 1,000 dashboard responses with four concurrent streams. Requests are fully drained; all content/theme assertions pass, zero streams remain active, and no timeouts occur. This is a short count-based retention diagnostic, **not** the previous twenty-minute soak or an hours-long leak certification.

| Theme regime | Baseline retained heap change | Runtime retained heap change |
|---|---:|---:|
| Two repeating themes | −0.40 MiB | +1.34 MiB |
| 2,000 distinct accents | −2.29 MiB | +42.07 MiB |

Unique runtime themes grow steadily across forced-GC checkpoints without a plateau. This implicates the current approach of passing a newly resolved whole-theme object into Goober's process-global caches. Private response targets prevent stylesheet sharing between requests; they do not bound the engine's serialization cache. The baseline does not implement equivalent custom-theme SSR, so its flat profile is a control rather than feature-equivalent proof of a universal runtime penalty.

A separate mitigation control keeps component styling in Goober but puts resolved theme variables on the theme boundary using React's inline `style` prop. It completes4,000 measured SSR renders plus 80 warmups in 13.53 seconds. Unique-theme retained growth falls to 1.35 MiB; finite-theme growth is 1.38 MiB. Requested theme values, component Goober resources and stream cleanup pass. This supports avoiding theme-cardinality cache growth in the measured SSR path. It is **not an accepted architecture change**: this control still needs browser/hydration, nested/dark theme, portal and CSP evaluation. The original runtime candidate and its failure remain unchanged.

Forced GC is a measurement technique only. Thresholds in the scripts are provisional investigation triggers, not agreed production memory budgets. The first soak build encountered a CJS/top-level-await harness error; its record is retained, and the worker's async entry correction did not change the runtime foundation.

## What must be decided or tested next

1. Define the customization contract: preserving existing selectors also preserves their precedence over some hover utilities, and unlayered styles beat Tailwind 4 layers. A universal layer policy cannot be assumed safe with Tailwind 3's unlayered preflight. Review the separate layer diagnostic before selecting a policy.
2. Review the inline-theme mitigation. If chosen as the next candidate, repeat browser/Next isolation and hydration checks before acceptance; do not transfer this candidate's passes automatically.
3. Cover portal styles and theme inheritance, nested/dark themes, arbitrary dynamic component props, full chat shell with runtime styles, package installation/root exports and CSP. Broader/full-library selector conversion remains unverified.

No package, component or ownership decisions have changed. No production migration code or migration implementation tickets were created. The Wayfinder prototype stays open for joint review.

## Evidence and reproduction

- [Protocol](../PROTOCOL.md), [commands and limitations](../README.md)
- [Raw browser measurements](browser.json), [summary](detailed-summary.json), [bundle contents](bundle.json)
- [Production Next report](next-runtime.md), [checks](next-runtime.json), [failure details](next-failures.json), [executed hashes](next-executed-artifacts.json)
- [Server retention](soak-server.json), [inline-theme control](soak-inline-control.json)
- [Selector history](../runtime/CANDIDATE-HISTORY.md), [structural checks](../runtime/serializer-results.json)

After measurement, the authoring helper’s output root was changed from a fixed scratch path to its own directory for relocation/reproduction. Runtime component/adapter/descriptor source remained unchanged; the original measured source hashes and final artifact manifest are retained.
