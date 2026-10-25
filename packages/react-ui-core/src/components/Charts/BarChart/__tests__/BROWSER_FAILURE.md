# Installed chart comparison: shared measurement mismatch

Status: **FAIL, full Cartesian/mini browser matrix incomplete**. No production correction by Worker2. All Chrome contexts and local servers closed; browser explicitly released to Worker1 for its owned shared fix and a new immutable artifact. Do not report all11 entries or six framework/order cases passing.

## Exact measured artifact

Product7e425b5b7261b47dc28e331e7afc223179990237; normal consumer /private/tmp/core-chart-final-consumer; tar /private/tmp/core-chart-final-artifact/openuidev-react-ui-core-0.0.0-beta.0.tgz,1062310bytes, SHA256546f680f12516b0702cfb7c07bd092a781b4a402e8d9ee4e79b17eb9149424eb. Every installed file matched the verified archive; package and lock remained unchanged in measured runs. Full per-file manifests, source/fixture/runner/bundle/host/baseline-CSS hashes and browser version are in raw JSON. Separately, all12 owned focused tests pass against this normal installed artifact (installed-focused.log).

## Attempts

1. attempt-1.log: fixture baseline import paths omitted Charts/. Bundling failed before Chrome opened; no product defect or browser result. Test-only path mapping corrected.
2. attempt-2.json/log: actual Chrome reaches plain/before/line/none and fails with candidate Y-axis28px versus legacy27px, shifting the plot/grid/ticks. Earlier Area and AreaCondensed paths completed in this case, but the case itself is failed and no full-matrix acceptance follows. Complete failing snapshots retained. Source-equivalent attempt-2.runner.mjs hashes exactly to the report runnerSha256.
3. line-diagnostic.json/log isolates Line and captures missing CSS tokens. Its computed SVG font shorthand is empty, so the initial canvas probe fell back to browser10px defaults; those probe widths do not establish the actual12px budget. The runner snapshot is preserved and hash-matches.
4. line-diagnostic-2.json/log corrects the diagnostic font to the existing12px theme font. It reproduces the same geometry mismatch and records the cause below. The runner snapshot hash matches this report. Product source/package unchanged throughout.

## Root cause and ownership

The old stylesheet imports openui-defaults.scss, supplying global --openui-text-label-xs and --openui-text-label-xs-letter-spacing. Runtime core uses authored fallback styles without those globals. Rendered tick tracking is the same -0.12px in both arms, but scopeStyle.getPropertyValue('--openui-text-label-xs-letter-spacing') returns -0.01em for legacy and empty for core.

The copied shared hooks/core/useCanvasContextForLabelSize.ts falls back to userTheme.textLabelXs for font, but only reads the CSS channel for letter spacing. In no-provider core rendering, its canvas therefore lacks the tracking used by rendered ticks. The focused browser probe records the same12px font in both arms: '-10' width17.34375 unspaced versus16.9837646484375 with rendered spacing. measureYAxisWidth uses ceil(width)+10, producing28 versus27px exactly. All other inspected rendered style declarations match; geometry diverges as a consequence.

This hook is Worker1-owned. Independent Spec review confirms the conventional remedy: retain CSS-variable precedence, fall back to userTheme.textLabelXsLetterSpacing when absent, and include that token in the memo dependencies so theme changes remeasure. No global token injector, new measurement layer, custom resolver or dependency patch is required. Worker2 did not edit shared source or legacy.

## Retest gate

Worker1 must implement/review the bounded shared fix, preserve this red evidence, freeze a new normally installed artifact and explicitly release its exact revision/hash/consumer/browser window. Then rerun the focused Line no-provider case and the complete owned matrix; other not-yet-reached failures/coverage gaps remain possible. Existing HorizontalBar numeric-width and unwired-onClick defects, Scatter missing print metadata and public domain clamp remain separately inherited, not fixed here. SSR/performance/memory remain uncertified.
