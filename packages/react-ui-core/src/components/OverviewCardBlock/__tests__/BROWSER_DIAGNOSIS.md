# A/C initial browser run — real carousel width mismatch

Browser and server are closed. **Window released to Worker1.** No active Worker2 measurement remains. Frozen consumer and lock were verified unchanged after every attempt. Worker1 owns production correction/repacking; current Worker2 scope is tests/evidence only.

## Exact artifact

Production `baa3c1d935d06e923ab9aa43ae3a97f3d3fd0ff5`.
Normal install `/private/tmp/core-data13b-consumer`.
Tar `/private/tmp/core-data13b-artifact/openuidev-react-ui-core-0.0.0-beta.0.tgz`,491804 bytes.
SHA256 `f64973409f551181976cafa76b85a5915262f11e1bc2e2fe48a17c9103e069f4`.

Prepare-only passed: every installed file matches that exact archive, root exports present, baseline/runtime bundles built and inputs hashed, no legacy candidate imports. Strict fixture types and syntax passed; exact hashes remain in reports. Host order is established before test-only React mount. No recovery from later stylesheet reordering is claimed.

## Product finding — narrow Overview carousel rule order

Third attempt `results/browser-carousel-failure` stops in plain/before/cards at `carousel-start-mask`,450px container. Both arms reached real overflow and expected initial right-only mask. Legacy cards are200px (12.5rem); candidate240px (15rem). Track width1048 versus1248. Full expected/actual style/geometry arrays and original assertion output are retained. No comparison was adjusted or suppressed.

Public stock Goober `extractCss` diagnostic against the unchanged installed package confirms:

| Emitted offset | Selector                                                                                                                                 | Width                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 52830          | `.go2437725739.openui-small-card-block--overview-card.openui-small-card-block--carousel :where(.openui-small-card-block__carousel-item)` | 12.5rem, inside narrow container query |
| 52981          | same selector and specificity                                                                                                            | 15rem, later base rule                 |

Repeated container-query grouping emits the narrow override before the later authored base rule. Equal specificity means15rem wins. Conventional fix: move the base overview15rem rule **before the first container-query block** in owned `cardBlockLayout.styles.ts`; verify emitted order, repack and retest the same frozen-artifact comparison. No selector specificity change, custom parser/cache/injector or dependency patch is needed. Independent Standards reviewer confirmed this diagnosis and recommendation, read-only.

The first plain/before/leaves case passed2,756 snapshots on this artifact. Cards reached themes/static/counts/responsiveness/callbacks/hover/focus before the carousel failure; these partial checks are not recorded as a complete cards pass. The remaining matrix has not run. No A/C whole-matrix acceptance or slice13 acceptance follows.

## Earlier preserved test-only attempts

- `results/browser-first`: snippet card-focus comparator saw a delayed-open nested RHS tooltip in baseline and closed tooltip in candidate. The first differing node otherwise had identical computed styles/geometry. Center-card hover accidentally targeted nested tooltip content; independently reviewed correction isolates card hover on padding and explicitly closes/waits for unrelated tooltips before focus. Full explicit LHS/RHS tooltip comparisons remain, not filtered from snapshots.
- `results/browser-focus-attempt`: hover at1px reached outside the card under its preserved scale(0.995), so Playwright reported the grid wrapper intercepting pointer events. Corrected to5px inside padding with normal hit testing; no force flag or event simulation.
- Third attempt adds native tooltip-trigger focus observation and keeps real hover/open/Escape/dismiss and truncation checks. Those dedicated tooltip cases occur after carousel checks and therefore have **not executed yet**. Do not claim tooltip focus/portal acceptance from preparation.

All attempts preserve their original report/log/runner; fixture is retained where available. Reports contain exact runner/fixture/host/bundle/installed manifests. The repeated leaf case is one unique matrix case, not three independent cases. No production, frozen package, lock, legacy or preview changes occurred.

## Retest and integration handoff

After Worker1 commits the conventional ordering fix and issues a new normal-packed artifact/hash/revision plus browser release, rerun affected A/C checks. Keep original failures immutable and do not relabel them as testing the fix. Worker1's medium-layout/D-family browser evidence remains its responsibility; do not repeat unrelated B/D or slice12 matrices.

Evidence JSON/diagnostic files are raw. Integration format checks should exclude these narrowly rather than rewrite raw report bytes. Package metadata/formatter config belongs Worker1. Current runner source changes are only deterministic test-state corrections described above.

SSR/hydration/streaming, performance/memory, full accessibility and the accepted separate math/Vite contract remain outside this matrix. No merge/release/ticket closure.

## Authored correction prepared — browser green still pending

Root explicitly reassigned Worker2 the shared-card style correction. The exact existing15rem base rule now precedes the first container block;12.5rem, selectors, specificity and all other declarations remain unchanged. One concise comment explains the ordering. No runtime transformation, dependency update or new API.

The browser regression now asserts all five actual carousel item widths at containers450/480px →200px and481/700/900px →240px in both arms, with the strict full-style/geometry comparisons retained. The existing failed real-browser report above is the red regression evidence; the strengthened assertions await the new frozen package. Chrome remained idle throughout this source correction.

Scratch build, strict source types, six owned behavior tests and semantic lint pass. Public extractCss diagnostic now emits15rem before12.5rem, recorded under results/order-correction. This diagnostic establishes emitted order, not computed browser geometry. Both independent Spec and Standards reviews report zero actionable findings. Worker1 must integrate/repack and provide exact corrected artifact/revision/hash plus browser release before retesting. Original failures remain untouched.
