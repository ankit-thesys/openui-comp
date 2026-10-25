# Cartesian and mini installed-browser plan

Status: harness prepared, not run. Worker1 owns FIRST chart browser window. Do not launch Chrome before explicit release and exact frozen normal artifact revision/hash/consumer. No browser acceptance is inferred from source checks.

## Source checkpoints

- Shared typesad6f92672 integrated0655e3e47; prerequisites2bce137ad already equivalent in Worker1 ancestry.
- Foundationcf0301e53 integrated2c78c1908.
- First Scatter public dataset TDDred12b839bad precedes Area/helpers5851f0624.
- Line/Bar/Scatter5d6ca7dba; Minis c2c8358d3.
- All12 owned focused public-root tests pass together in staged built root; build, strict source types, scoped semantic lint and formatting pass. Mini production files are exact copies; other family logic differs only by styling imports/classes. Each batch has independent GPT6.1-Sol Spec/Standards reviews with no remaining actionable findings.

## Prepared runner

Run charts.browser.mjs with CORE_CONSUMER, CORE_ARTIFACT_PATH, CORE_ARTIFACT_SHA256, CORE_ARTIFACT_REVISION, CORE_BROWSER_TOOLS, CORE_SASS_TOOLS, CORE_HOST_STYLES and CORE_BROWSER_RESULTS. All paths must be absolute. The consumer must be a normal npm install, not a workspace symlink. Every installed package file must match the verified tarball. Report includes source revision/tarball size/hash, per-file manifest, lock/runner/fixture/bundle/host/legacy-CSS hashes and browser version. Package/lock must remain unchanged at completion. --prepare-only verifies provenance and bundles without Chrome after a confirmed artifact is supplied.

Fixture imports only public core APIs. Baseline maps condensed/horizontal to unchanged legacy family barrels, with legacy ThemeProvider/PrintContext from their own modules; Sass compiles the old stylesheet read-only. Root resolves seven parents from this nested directory. Esbuild candidate inputs must exclude legacy source. Math CSS externalization applies only to this non-math fixture, with an assertion that no residual vendor import remains; existing Vite math delivery is separate evidence.

## Coverage to execute

All11 owned public entries: Area/AreaCondensed, Line/LineCondensed, Bar/BarCondensed/HorizontalBar, Scatter and MiniArea/MiniBar/MiniLine. Six framework/order cases: plain CSS/Tailwind3/Tailwind4, host before/after component CSS verified before mounting. Existing theme/customization APIs only; no consumer setup machinery or custom Goober patches.

For each family: no/default/custom light/dark theme, nested/independent scopes and explicit palette; actual container widths280/480/768; numeric/string width and height separately (mini80/160/100% size); empty/live-populated updates; grid/legend/stacked options; real pointer tooltip and callback values; supported legend hide/restore with actual mark-count changes; explicit root utilities checked independently; real CSS entrance existence and matched timings, then settled parity; reduced-motion decorative gates; print media and separate React PrintContext export metadata; cleanup/remount and host sentinel. Condensed long labels and scrolling families get a constrained live update; native Enter activates enabled scroll buttons and viewport position must actually change and stabilize.

Paired computed styles, SVG geometry/attributes/text and element rects must match and remain unchanged for three consecutive100ms-spaced samples after config readiness/font/two-frame settling, bounded to30 attempts. Actual scroll movement must stabilize for200ms within6s, not a fixed delay. The runner does not use mocked observers, forced clicks or synthetic geometry. Emitted scrollbar selectors from stock object serialization are valid in source diagnostics; actual pseudo/scroll behavior stays pending here.

## Inherited behavior and limits

Horizontal numeric width affects scales without setting its CSS box; compare rather than silently fix. Horizontal onClick is declared but not wired in legacy source; verify no callback and disclose it. Scatter's root does not receive print-export metadata, despite shared type support; verify/disclose rather than invent it. Public scatter domain helper clamps the lower bound even for negative x data; unit regression preserves it. Legend rows lack an authored native keyboard activation contract; no accessibility certification is claimed. Mini click callbacks receive the native React event through the existing frame.

Static markup tests validate initial output only, not SSR/hydration styling. This matrix does not certify SSR, transport/parser streaming, performance/memory, all19 families (Worker1 owns others), arbitrary dynamic host stylesheet recovery or frame-by-frame animation timing. Corrected PR30 friend baseline is read-only reference; no writer runs in reserved validation/friend-chart-baseline and no unsupported baseline scenarios are counted as passing.

Harness syntax and strict fixture types pass. Both independent reviews are clear after requiring stable comparisons and replacing a fixed scroll delay with actual stable-position observation. Reviews were read-only and did not run Chrome. Normally installed bundle preparation and measured browser evidence remain pending. Preserve raw JSON/log bytes and original failed attempts; owner fixes only, report shared issues to Worker1.
