# HorizontalBar “Scroll down” accessibility investigation

**Bounded verdict: the historical missing-button signature is consistent with non-atomic sampling of inherited unstable layout/conditional control mounting. No new migrated missing-role/name or keyboard-activation regression was reproduced. The underlying instability and intermittent absence of controls remain real shared limitations; historical strict failures and geometry differences remain failed/unresolved.**

## Exact evidence

Three distinct historical 390px cells matching the user's signature were located:

- `horizontal-string-height-known--plain--390--light--instant`, run `2026-10-25T23-34-55-589Z-matrix-s4`.
- `horizontal-string-height-known--plain--390--dark--instant`, interrupted run `2026-10-25T23-34-26-563Z-0aebe94b`.
- `horizontal-string-height-known--tailwind4-after--390--light--instant`, run `2026-10-25T23-34-55-589Z-matrix-s4`.

`three-reported-cells.json` retains full original measurement paths, compressed-file hashes, browser/build/archive provenance. Extracted originals are separate files; nothing was overwritten. The final reconciliation is a different evidence set: five semantic differences, including both mismatch directions. That does not erase earlier failures. The historical same-case repeats change which arm lacks the button, weakening a fixed new-markup-defect explanation.

Historical plain/light and plain/dark probes recorded **no visible buttons in either arm**, but the immediately subsequent legacy accessibility snapshot contained `button "Scroll down"`. This demonstrates different sampled states within one arm. In the Tailwind4-after/light probe legacy had a native enabled BUTTON named Scroll down; migrated's visible-element probe omitted it. The benchmark's `captureArm` reads DOM, awaits ariaSnapshot, then later captures a screenshot; it also captures arms sequentially. A chevron in the later screenshot cannot establish the earlier accessibility state.

## Reproduction and controls

Used immutable runtime from `2026-10-25T23-34-55-589Z-matrix-s4`, validating **every runtime bundle hash** against its recorded provenance before launching. Legacy archive SHA-256 `f38b45035706e9151a57d3328d2c23ec448483b73c5f0d5c64ba7420652b6fd9`; migrated core `a5d002d20a6fbed1cdb61cddc255f1619dc945d08cf9406eb3ce94e135988fe2`. Exact inventory: `runtime-provenance.json`.

Chrome for Testing156.0.8078.47; identical native paired iframes, each390x720, default theme light/dark as recorded, public A=4/B=7 data, categoryKey category, dataKeys value, `height:"100%"`, `fitLegendInHeight:true`,300px parent. Ran only the three cells twice: **six pairs**, plus one plain/light pair solely for positive native Chrome AX witnesses. No full matrix, source edits, CSS overrides, motion disabling, forced roles, dimension freezing, manual scroll-position injection, forced clicks or AI/network calls. No `[data-bench-motion]` sheet was present. Scripts serve preserved runtime read-only on temporary private ports; lab4188 untouched.

| Observation | Result |
| --- | --- |
| Same-frame paired DOM/geometry/scroll trace | **240frames ×6pairs =1,440paired frames** |
| Matched wrapper/inner/body geometry and overflow measurements | **1,440/1,440paired frames** |
| Control-presence mismatches at those matching states | **Zero** |
| Frames with mounted controls per arm per pair |132/240 in both arms |
| Captured controls losing native BUTTON/name or gaining ancestor hidden/inert/aria-hidden | **Zero** |
| Measured inner widths | Both alternate310px and346px |
| Distinct wrapper heights | Both37 per pair; raw zero/small/restarting heights preserved |
| Enter/Space checks | **24/24** real focus+trusted key/click events; subsequent actual scrollTop movement in both arms |
| Positive native Chrome AX witnesses | Both expose unignored `role:button`, `name:Scroll down`, focusable:true and focused:true |
| Page errors | Zero |

Full raw trace/ResizeObserver/outerHTML/visibility/disabled/scroll records and native AX trees are in `browser-results.json`, individual `*-result.json`, and `AX-witness-results.json`. `analysis.json` contains derived counts. Screenshots were captured without styling/moving the iframe or disabling animations.

The four originally planned time-based AX checkpoints happened during no-control phases in both arms. Those are not false passes or proof of positive AX exposure. The additional focused overflow witness explicitly records native CDP `Accessibility.getFullAXTree` plus the DOM/ARIA snapshot. Both old and migrated expose the named button then. All positive keyboard evidence uses normal accessible-role lookup and real browser keyboard input; no dispatched synthetic events.

## Actual control and likely cause

Both packages render a native `<button aria-label="Scroll down">` through IconButton. Explicit `role` is null because BUTTON has the implicit button role. Label/name forwarding is intact. The down control is enabled and visible in captured mounted phases; it has no own/ancestor aria-hidden, inert or hidden flag. The up control initially has disabled=true and visibility:hidden, which is inherited behavior, not a lost role. Exact old/new outerHTML is retained in traces.

Both shell implementations gate the button column on `scroll.needsScroll`; ScrollButtonsVertical additionally returns null if neither direction can scroll. Its disabled style hides controls. `useHorizontalBarChartOrchestrator` derives bodyHeight from the repeatedly measured inner height minus legend/axis space, then compares contentHeight to bodyHeight. `useContainerSize` observes that same height-dependent inner node. Under string-height plus fitting legend the feedback repeatedly crosses the mounting threshold. Adding/removing the CSS36px gutter explains the exact310/346inner-width alternation. It is not an independent width conversion error in the tested artifact.

Importantly, in **108/240samples per arm per pair**, scrollHeight still exceeded clientHeight while no control was mounted. For example, both showed wrapper246px, body198px, scrollHeight209px, no control. This is a shared usability/access limitation, not a claim that conditional hiding is always correct. The controls also repeatedly remount due to the height loop. Successful bounded keyboard checks do not certify continuous keyboard reachability.

Source anchors and hashes are in `source-evidence.json`: migrated `HorizontalBarChartImpl.tsx:196`, `useHorizontalBarChartOrchestrator.ts:221–225,269,418–439`, `ScrollButtonsVertical.tsx:17,51–52`; legacy equivalents are recorded there. Both measurements use the same ResizeObserver hook; both icon buttons default to native BUTTON and forward aria-label.

## Disposition

1. **Do not create a new missing-role/name patch from these snapshots.** No new missing semantic/name defect was reproduced; the same measured conditions expose equivalent controls and native AX roles.
2. Keep the historical semantic comparison failures and geometry/height-stability failures intact. Record this scoped causal investigation beside them, without blanket known-issue suppression or green relabeling.
3. Track the inherited measurement/control availability defect separately. A future intentional fix should measure a stable containing dimension and validate actual overflow/control reachability, followed by bounded keyboard/resize tests. That is a behavior change requiring its own decision; no legacy/new production changes were made here.
4. Avoid comparing independent asynchronous snapshots of oscillating states as if they were identical checkpoints. Retain raw timelines/DOM state around each AX capture. Do not freeze CSS or loosen strict comparisons to hide the instability.
5. Evidence is for the preserved original core artifact. It does not automatically certify the subsequent rename/template artifact. Worker1 retains that integrated-artifact validation gate.

**Browser explicitly released11:05:41UTC; temporary servers closed.** `browser-release.json` records six paired reproductions and the additional positive AX witness. Worker1 may resume the authorized template validation window.
