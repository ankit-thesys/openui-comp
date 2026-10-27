# Runnable shared-chart inputs for W1's existing harness — NOT RUN

Source candidate stays frozen at `6662ff5424a5a43b509d5912cd85dd56871ace01`. W1 retains browser/heavybuild ownership. This preparation ran only source reads, parser/syntax checks and hashes. It did not build, typecheck, install, launch a browser/server, or modify W1 files.

## Inputs

- `shared-scene.tsx`: public-component scene covering all12shared registrations with actual charts, not mock tooltip DOM.
- `shared-probes.mjs`: `runSharedChartProbes(page, {arm, theme, config})`, `compareSharedPair(baseline, candidate)` and `sharedHostSnapshotInPage()`.
- `shared-host-aliases.html` / `.json`:74old literal/expanded-prefix aliases plus combined HTML/SVG sentinel structures, including grid/zero line. No canonical targets.
- `keyframe-source-bindings.json`: all9keyframe bodies match the verifier's PR69 baseline; two shared and seven family keyframes. This is source-only preservation, not timing/media acceptance.

## Integration into the existing paired build/runner

Do not rebuild either package for these fixture inputs. Reuse the exact baseline/candidate archives and installed consumers already bound by W1. Add this scene as one optional branch of the existing fixture, then compile that existing paired fixture entry once per consumer using its current esbuild pipeline.

Copy `shared-scene.tsx` into each existing consumer directory with the other fixture files. This lets the current `jsx:automatic` resolve `react/jsx-runtime` through the consumer's pinned dependencies. Import from `./shared-scene` in the host fixture. It has no runtime UI package import of its own: pass the host's already imported `React` and `U` namespace, preserving host capture before package activation.

```tsx
import { SharedChartProbeScene } from './shared-scene';
// Inside the existing Scene function, after U's existing dynamic public import:
if (kind === 'shared') return <SharedChartProbeScene React={React} ui={U} theme="nested" />;
```

Use `window.renderScene('default', 'shared')` so the fixture's own explicit nested dark→light providers define the expected token values. For separate light/dark runs, pass `theme` through the scene branch; do not put another conflicting provider around the fixture and silently retain nested expectations. The shared scene's nearest light text is `rgb(31, 32, 33)` and dark text `rgb(211, 212, 213)`; this differs deliberately from the current W1 families fixture's theme tokens.

Embed the alias HTML outside `#app` and real chart roots, before the public package import. Capture the alias subtree with `sharedHostSnapshotInPage()` immediately before/after that import while framework CSS is unchanged between captures. For framework-after configurations, compare after interactions against the same baseline config; do not misclassify the intentional later framework reset as package leakage. Queries in the module are scoped to actual `data-shared-chart-scene` roots or `body > .openui-portal-tooltip`; sentinel aliases cannot satisfy interactions.

In the existing Node runner import the helper and use its existing page/server/browser:

```js
import { runSharedChartProbes, compareSharedPair, sharedHostSnapshotInPage }
  from '/private/tmp/openui-charts-w2-evidence/shared-probes.mjs';

// For each arm's existing page and config:
await p.evaluate(() => window.renderScene('default', 'shared'));
const result = await runSharedChartProbes(p, { arm, theme: 'nested', config });
// Persist result losslessly BEFORE any aggregate judgement.
// Compare paired results only when both executions completed:
const pairChecks = compareSharedPair(baselineResult, candidateResult);
```

The helper does not launch or close any runtime, edit production files, write evidence or silently accept failures. The caller saves raw returns and adds checks to its existing result ledger. A caught execution error returns a failed check and partial observations; it is not a skipped pass. Keep separate run totals and preserve any fixture correction history.

## Coverage and valid override choices

| Actual target | Scene / property |
| --- | --- |
| chart empty root | Real empty Bar; owned min-height241px |
| x/y axis labels | Actual condensed Bar; text-align:left / color |
| mini root | Real MiniLine; min-width123px; SVG single-point owned fill; real callback |
| default legend root | Real 12series Bar; gap17px and owned label color; expand/hide/restore, palette and plotted-series count |
| tooltip portal | Hover actual Bar mark; body portal, pointer-events:none, z-index1057; nearest nested theme |
| tooltip panel | Actual rendered panel; border-radius19px and label color; >10items five-item/view-more branch |
| horizontal scroll controls | Real24category Bar; root position; disabled cursor with root+part+native:disabled context, native scroll advance |
| vertical scroll controls | Numeric-height HorizontalBar; owned padding; enabled down click then real scrollTop/up-state |
| stacked legend root | Public standalone items; align-items; actual hover/active class/toggle/scroll; connected Pie also present |
| stacked layout | Connected Pie at520row/320column; gap23px, actual row/column, show-more |
| stacked scrollbar | Actual legend list; ::-webkit-scrollbar display only, not a promise native scrollbars become visible |

Every override first requires a positive scoped target count, actual `element.matches` on its consumer selector, an active matching owned declaration containing its canonical owner, no conflicting inline value, and a genuinely different before value. Media/support groups are filtered using native browser APIs. Pseudo-element checks match the originating element separately and read the exact pseudo via getComputedStyle. Consumer CSS uses public selectors only: no fixture ancestor/ID, private namespace or important declaration.

The disabled cursor includes native `:disabled` because the child is also IconButton with its own variant/disabled context. A weaker two-class probe is not promised to beat that inherited state. No hidden disabled button is clicked or forced.

## Framework/global/motion/optimized gates

Run the scene in the existing six plain/TW3/TW4 before/after configurations. Reuse parent CSSOM guard/list-member validation. Parent import/host-global ordering checks remain required; these inputs do not replace them.

For stock Goober `glob` interoperability, use its existing installed public API in the fixture entry, not a handwritten style tag posing as glob. Put a separate `.shared-stock-global-probe` sentinel outside the alias-capture subtree. Invoke `glob('.shared-stock-global-probe{color:rgb(4,5,6)}')` before or after the existing dynamic package import according to config, then expose an update that uses `glob` again with `rgb(7,8,9)`. Assert both actual computed values and alias isolation after update. These intentional sentinel color changes must not be part of an unchanged-host assertion. No new production utility is needed.

Use an existing screen/normal-motion page for natural mini600ms entrance descriptors and readable final opacity, then one existing reduced-motion page with the same scene to verify media activation. The helper awaits naturally finite browser animations; it never disables them. It does not claim JS-spring phase parity. Source9keyframes are preserved; parent family checks cover the unique family/print structures.

For optimized/lazy evidence, reuse W1's already planned small entries: static public BarChartCondensed with labels, MiniLineChart, Pie with legend/tooltip, empty Bar and standalone StackedLegend if needed. The full shared scene passes a UI namespace and is **not** a pruning benchmark. Bind entry-reachable graphs and exact input archives; do not treat all emitted files as loaded. No duplicate complete family matrix or package build is needed for this targeted extension.

## Limits / current disposition

These inputs are syntax/source-prepared but **unexecuted**. Runtime selectors, fixture readiness and geometry may reveal issues; preserve those results and amend test inputs separately from product fixes. Inline position/transform/opacity, container dimensions, legend swatch colors/hidden opacity and presentation attributes retain their distinct contracts. No generic inline-block or constrained width assumptions are used.

HorizontalBar uses pinned numeric height, legend=false and fitLegendInHeight=false; this does not repair or conceal the prior string-height/fit-legend witness or unwired click limitation. LabelTooltip is not ChartTooltip and has no owned registration; none is invented. No SSR/hydration/streaming-server, performance, memory, soak or release acceptance is claimed.
