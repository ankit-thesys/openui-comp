# Runtime Goober: deeper investigation

Status: experimental; styling execution model remains REOPENED. No production acceptance or migration ticket is implied. Previous static and runtime evidence is preserved in separate directories/commits.

## Question
Can consumers install and import actual OpenUI components with automatic runtime styling, while preserving their behavior and appearance, host customization, streaming SSR and isolation? What execution, payload and retention cost does that require?

Runtime computes CSS while rendering and delivers it with the used component. Static generation computes CSS before deployment and relies on stylesheet delivery. Either can support JavaScript tree shaking; stylesheet removal is a separate property to measure. Runtime costs may be small, but SSR delivery, style ordering and cache lifetime need explicit evidence. Static CSS moves that work earlier but still needs an automatic loading and ordering contract. Previous static timings are comparison evidence, not runtime measurements.

## Controlled arms

- Existing OpenUI components with their original compiled styles: execution baseline.
- Runtime Goober objects wrapping the same production components and production Renderer/parser/headless streaming adapter.
- Prior Goober-generated static experiment: retained historical comparison, not newly measured concurrently and not substituted for the baseline.

One-time generation from SCSS is prototype authoring only. Runtime descriptors are JavaScript objects and the Goober engine executes during rendering; the runtime consumer must not load the old component stylesheet. This does not establish a production conversion tool or full-library parity.

## Sequence and evidence

1. Diagnose actual selector serialization with minimal inputs. Keep failed variants. Preserve selector semantics rather than hide failures with blanket `!important`.
2. Check component defaults and states plus intentional host utility overrides under real plain CSS, Tailwind v3 preflight and Tailwind v4. Test first SSR output and late streamed components. A successful override alone is insufficient if reset styles break the other component defaults.
3. Freeze source. Production Next.js: no-JavaScript SSR, hydration/errors, interactive form and Button states, theme changes, navigation, late reveal, concurrent requests and aborted requests. Record infrastructure failures separately from styling failures.
4. Browser replay: equal chat/dashboard coverage. For each workload and load, exclude one warmup pair and record ten alternating baseline/runtime pairs in fresh Chrome contexts. Normal: three blocks, 60 chunks/s, 128 characters/chunk. Pressure: twelve blocks, 120 chunks/s, 64 characters/chunk. Preserve final source/text/style parity, typing response, long tasks, frame/update proxies and Goober calls/time. Do not call frame proxies direct React commit timings.
5. Bundle audit: minified component-only ESM, React external, compare a used Button and an unused import. Report JavaScript and CSS separately; do not extrapolate one component to an assembled registry or full package barrel.
6. Server retention diagnostic: fresh processes per arm/theme regime, warmup then 1,000 chat plus 1,000 dashboard renders, bounded concurrent streams. Finite themes vs unique theme values distinguishes repeated workload retention from cache cardinality. Forced-GC samples are diagnostics, not a production GC strategy. Any threshold is provisional; retained-memory trends and cleanup assertions matter more than a single RSS number.

## Interpretation rules

- No acceptance while required compatibility or appearance checks fail.
- Report adapter defects, Goober serializer behavior, CSS cascade rules and framework delivery issues separately.
- Performance deltas are paired local measurements. Small differences may be noise; no capacity/SLA claim or automatic pass based on a percentage.
- No consumer styling imports, scanner, setup command or plugin may be concealed in a fixture. Framework host styles themselves are legitimate inputs.
- React19 stylesheet resources, theme boundaries and any selector/layer policy are part of the library-owned integration cost, not stock Goober guarantees.
- Portal styles, arbitrary themes, CSP and untested components remain explicit gaps unless directly exercised.
- Keep Wayfinder prototype open for user review; preserve package/component/ownership decisions.
