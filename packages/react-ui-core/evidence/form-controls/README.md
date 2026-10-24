# Combined form-control artifact

This directory contains the combined #10 slice evidence: 42 framework/order cases and 91,602 paired style snapshots passed, alongside 32 package tests and 21 installed public consumer tests. OptionCards is explicitly deferred. The earlier `Chips/__tests__/results/` evidence applies to Worker 2's scratch producer, not this combined package.

`artifact.json` identifies the exact installed tarball, production inputs/build outputs and stock Goober file. `form-controls.tgz` is that tarball. `primitives.json` and `composites.json` record paired Chrome runs against read-only legacy components, plain CSS/Tailwind v3/v4, both stylesheet orders and five theme states. They cover states, explicit important overrides, responsive widths, portals where applicable, host preservation and remount cleanup. Snapshot counts refer to paired element/style snapshots, not independent test cases or screenshots.

The new package arm never loads legacy CSS. The reference arm compiles the old index.scss read-only using normal Sass and resolves dependencies from the same installed package graph; React is aligned for the comparison. This is test-only setup, not consumer styling integration.

`layout.log` verifies public layout context and controlled Calendar rerenders with onSelect in all four layouts. `interactions-*.log` records six real-Chrome composite scenarios, including debounced updates with an advancing clock. `packed-tests.tap` uses the installed tarball's public root; strict consumer logs cover Bundler, NodeNext ESM and NodeNext CommonJS with skipLibCheck false. `ci.log` records complete scoped CI. `review.md` records independent standards/spec reviews.

## Inherited limitations

`inherited-risk-comparison.json` is Worker 2's earlier separate read-only legacy/extracted comparison. `inherited-risks-final.json` and its log rerun that diagnostic through the final combined tarball; `Select/__tests__/inherited-risks.browser.mjs` preserves its reproduction. It shows matching Select hideDropdownIcon crashes and textValue visible-text behavior, DatePicker controlled clearing restoring a stale date, isOpen=true staying open without its setter, and its non-keyboard-operable div trigger. These checks establish parity with inherited limitations, not successful desired behavior. `isOpen={true}` without its setter is a controlled-prop usage constraint; remaining open in that scenario is not itself an extraction bug. No behavior fix was authorized in this extraction; these scenarios need separate decisions before wider beta acceptance. The prior Calendar report omitted onSelect; controlled Calendar updates pass when onSelect is supplied.

IconButton preserves the existing native button type default, including form submission unless the consumer supplies type="button". No new universal "error-free" claim is made. SSR/hydration/server streaming/concurrent request isolation and performance/soak acceptance are not established by this slice's browser style tests.

## Reproduce

Normally install `form-controls.tgz` with React/ReactDOM 19 in a fresh temporary consumer. The recorded runtime uses 19.2.4. For the comparison arm only, expose clsx 2.1.1 as a direct test dependency for legacy sources. Extract `../browser-host-styles.tar.gz` into a temporary host directory.

Set CORE_CONSUMER to that consumer, CORE_BROWSER_TOOLS and CORE_TEST_TOOLS to the producer package containing esbuild/jsdom, CORE_SASS_TOOLS to tooling with Sass, CORE_PLAYWRIGHT to Playwright's index.mjs, and CORE_HOST_STYLES to the extracted host directory. Run the `CheckBoxGroup/__tests__/compatibility.browser.mjs` and `Chips/__tests__/compatibility.browser.mjs` runners with fresh CORE_BROWSER_RESULTS paths. Run `Calendar/__tests__/layout.browser.mjs`. Run `Chips/__tests__/interactions.browser.mjs` with CORE_CASE equal to chips, select, slider, sliderBlock, calendar and datePicker. Browser tooling is maintainer-only.

Verify evidence bytes using SHA256.json. No merge, release, publication, whole-migration acceptance or issue closure is implied.

For inherited-risk diagnostics, run `Select/__tests__/inherited-risks.browser.mjs` with a fresh CORE_RISK_RESULTS path. The diagnostic deliberately catches the inherited hidden-icon crash and compares observations; it is separate from successful behavior tests.
