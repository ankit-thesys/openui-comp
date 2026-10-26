# Runtime Goober: focused prototype and decision plan

### SSR deferred; explicit consumer overrides — October 24

The user deferred SSR support for the current evaluation and authorized testing explicit overrides with stock Goober. The styling decision remains **open**; no custom patches are accepted. This supersedes SSR as a current beta evaluation gate, without claiming SSR works or changing package/component ownership.

The unmodified stock unlayered candidate passed 60/60 sampled normal/hover/disabled style checks across plain CSS, Tailwind v3 and v4, with host CSS before and after Goober. Native disabled Button clicks remained suppressed. The contract uses scoped plain CSS `!important`, v3 `!utility` and v4 `utility!`; no global configuration or custom machinery. Coverage is Button, Input and TextArea; classes were applied through the DOM to isolate cascade behavior. React prop forwarding, other component/state coverage, selector limitations, performance and memory remain unvalidated by this follow-up. This is not full migration approval.

Evidence: [explicit-override report](/Users/ankitdas/thesys/openui-styling-prototype/packages/react-ui/prototypes/styling/runtime-stock-explicit-overrides/REPORT.md).


### Stock Goober only — October 24, decision still open

The user has ruled out maintaining the experimental private parser patch, generated cascade guards, implementation-dependent server target and custom stylesheet-delivery bridge. Preserve those candidates as historical comparison evidence; do not reintroduce that machinery to satisfy the acceptance gates.

The [stock Goober assessment](https://github.com/ankit-thesys/openui-comp/blob/c73310ad10480c2bbcc035cfe18bdeab3681a560/packages/react-ui/prototypes/styling/runtime-stock-goober/REPORT.md) tests the unmodified published Goober 2.1.19 distribution with actual OpenUI components, real chat/dashboard HTTP streaming and parser, React 19.3.1, Chrome and production Next.js 16.4.2. It records 24 catalog runs, four full-chat cases, direct SSR/concurrent-stream/selector controls, bundle/unused-CSS checks and server-first/hydration checks.

Browser automatic styling, sampled unlayered default parity, actual chat/dashboard streaming, buffered SSR with explicit documented extraction, hydration, tested portal theming and direct-import tree shaking pass within the report's scope. Button-only rendering emits 7,415 CSS bytes with no chart/shell CSS; repeated message fixtures reuse the existing stylesheet.

**Blockers remain:** without application integration, SSR and Next streamed markup have no component CSS until client hydration. Overlapping streams share Goober's default stylesheet and extraction drains another request's styles. Unlayered output fails expected consumer overrides; the simple layered policy loses defaults to Tailwind v3 preflight and late-established v4 layer order. These cascade failures are integration constraints, separate from the reproduced complex-selector parser limitations. An ordinary selector rewrite passes the isolated Switch-equivalent control, so a private parser fork is not established as unavoidable.

This is not a stock performance or long-soak approval. Prior static/custom-runtime timings and memory findings do not transfer. Full installed-package, exhaustive selector/state/theme and memory/pressure validation remain unproved. Neither runtime nor static is accepted; migration implementation tickets remain paused. Preserve all package, component, folder and ownership decisions. Review the supported integration contract and remaining blockers together before choosing the execution model.


Status: execution model reopened by the user on October 23, 2026. Neither runtime nor static is accepted. This is a prototype evaluation, not migration implementation tickets. Package/component/ownership decisions remain unchanged. Review the evidence together before choosing an execution model.

### Component-owned runtime optimization — October 24, decision still open

The [new frozen prototype report](https://github.com/ankit-thesys/openui-comp/blob/a35351b9f7c3a7253d9aaf1a62907d7b85d3155e/packages/react-ui/prototypes/styling/runtime-component-ownership/REPORT.md) records ordinary component-level style ownership, lazy immutable compilation, native React resource delivery and the existing portal-theme API. It removes eager all-family chat delivery, repeated immutable compilation and the fake browser target. Full-chat inline CSS falls from 1,500,896 to 339,692 UTF-8 bytes (77.4%); a Button-only render emits 13,820 CSS bytes with no chart/shell styles. Correctness passes the twelve-configuration component matrix, actual full-chat integration, production Next SSR/hydration/streaming and concurrent theme checks.

Fresh measurements include 140 Renderer and 120 full-chat samples, 1,680 checked SSR responses including warmups, three fresh-process RSS pairs, and twenty measured minutes of server/browser soak. At concurrency50, median-repetition document p95 is 839 ms runtime versus 743 ms baseline; throughput is 69.7 versus 82.9 responses/s. Paced browser completion is near baseline, but unpaced full-chat dashboard remains 17.2% slower. Baseline linked CSS is not fetched by the SSR pressure client; these are document-delivery observations, not complete-page capacity estimates.

**Memory is not fixed:** matched retained JS heap, DOM/listener/style/rule budgets pass, but the long browser run ends with runtime gross Chrome RSS about 303 MiB above baseline and about 242 MiB above its own warm checkpoint. Short repetitions show the opposite terminal ordering, so attribution remains unresolved; renderer-process totals dominate the long-run growth. Do not infer a CSS leak or dismiss the signal.

The [standard/custom audit](https://github.com/ankit-thesys/openui-comp/blob/a35351b9f7c3a7253d9aaf1a62907d7b85d3155e/packages/react-ui/prototypes/styling/runtime-component-ownership/DESIGN-REVIEW.md) explicitly identifies the inherited private Goober parser patch, generated cascade guards and implementation-dependent server target. Stock Goober still fails the new Switch selector control. These are not accepted production practices. A supported engine/SSR contract, native-memory diagnosis, dashboard cost and remaining coverage require review. Styling remains **reopened**; no migration implementation tickets, production migration or package/component/ownership changes. Historical static and runtime evidence remain preserved.

### Expanded components, full chat and fresh measurements — October 24, decision still open

The [expanded runtime report](https://github.com/ankit-thesys/openui-comp/blob/c2ba24f390d5ebf14ba19178769bfda0a1005d6e/packages/react-ui/prototypes/styling/runtime-expanded/REPORT.md) supersedes the prior bounded Button/cursor findings for this new candidate. All 12 catalog configurations pass (plain CSS/Tailwind v3/v4 × two actual CSS orders × baseline/runtime), including the corrected disabled-cursor contract, sampled controls/portals and Bar/Line/Pie charts. Actual full-chat streaming and production Next checks pass within their documented scope.

This evidence uses **a private experimental Goober 2.1.19 parser patch**, required by actual complex selectors, plus a library-owned cascade guard serializer. It is not stock Goober certification or acceptance of a maintained fork. Full-document SSR/Next preserves styles; fragment SSR loses styles on unmount/remount and remains unsupported. The real SSR chat store is empty; a separately labeled actual Renderer/parser companion supplies SSR content, followed by actual HTTP chat after hydration. AgentInterface is only a test subject, not newly approved for extraction.

Fresh measured runs include 140 Renderer and 120 full-chat samples. Paced completion is close to baseline; saturated paired changes are +11.3%/+8.9% for chat/dashboard Renderer, +15.0% for expanded controls, and +3.1%/+7.0% for full chat. Cold local full-chat readiness adds about 48 ms. At 50 concurrent Next document requests, median repetition p95 rises from 658 ms to 1,406 ms. This test includes runtime inline CSS but does not fetch baseline linked CSS; it measures document delivery, not whole-page capacity. Full chat emits 1,500,896 CSS bytes and still aggregates all 47 selected style families, so minimal unused-style delivery is not established. The dedicated Button entry adds 3,942 gzip JavaScript bytes, excluding baseline CSS.

The fresh twenty measured minutes of server/browser soak (five minutes per arm in each environment) stay within the provisional retained-heap/resource investigation budgets, with no recorded errors or live browser streams after teardown. Runtime still retains about 4.6 MiB more JavaScript heap per browser page; terminal gross Chrome RSS is about 364 MiB above baseline and needs further native/process-memory investigation. RSS can count shared pages more than once and does not isolate CSS allocations. This is bounded evidence, not proof of leak absence or a small total memory impact.

Styling remains **reopened**. Review parser-patch maintenance, style payload/SSR cost, remaining SSR boundaries, package-install/tree-shaking proof, strict CSP and untested variants before accepting an approach or creating migration implementation tickets. Package/component/ownership decisions and historical static evidence are preserved. Read the linked report for exact coverage, raw results, failed attempts, limitations and reproduction.

### Inline theme and automatic CSS follow-up — October 24, decision still open

The [new runtime follow-up](https://github.com/ankit-thesys/openui-comp/blob/d301886813dfe345cd24a9405fdbf18da7650699/packages/react-ui/prototypes/styling/runtime-inline-followup/REPORT.md) supersedes the previous inline-theme browser gap and demonstrates a bounded Button compatibility solution. Inline variables alone preserved SSR/hydration tokens but the original ThemeProvider still wrote to body. A library-owned stable theme scope removes that leak: 29 focused checks pass, including complete tokens, nested/dark/sibling themes, unchanged outside content, client navigation and concurrent documents.

The combined production Next prototype passes 85 recorded checks. Button defaults use a named CSS layer plus an internal, property-specific rollback guard; consumers supply no CSS import, framework flag, styling setup command or build plugin. Initial-shell SSR, hydration, default states, plain CSS/Tailwind v3/v4 normal and hover overrides, and delayed first-visible Button/Table styling pass. Twelve simultaneous distinct-hue requests retain their own tokens. CSS arrives after hidden streamed markup but before React reveals it; hidden no-JavaScript delayed content is not claimed as a visible rendering pass.

The separate Button matrix passes 24/24 state/order cases and 24/24 unrelated-sizing checks. A stricter disabled-cursor priority contract passes only 20/24: ordinary cursor utilities behave differently between v3/plain CSS and v4. Compatibility is demonstrated for Button only, with standard layer order; broader component/chart/full-chat coverage, portals, strict CSP and unusual host resets remain unproved. Stable resource counts across 120 theme changes are not a new long memory soak. This changed candidate has not repeated performance/bundle/long-soak measurements.

These are experimental library integration responsibilities, not an accepted Goober architecture. Styling remains **reopened**, migration implementation tickets remain paused, and package/component/ownership decisions and prior static/runtime evidence remain unchanged. Review the customization contract and broader coverage before acceptance.

### Detailed runtime follow-up — still unaccepted

The [deeper runtime investigation](https://github.com/ankit-thesys/openui-comp/blob/51077c9be7c016441e95acd456ff51ab6d95a3ca/packages/react-ui/prototypes/styling/runtime-detailed/results/DETAILED-RUNTIME-REPORT.md) supersedes the first pass's selector/hover findings for its tested slice: nested Goober objects preserve 293 selected selectors, actual Button states match the original, and normal plain CSS/Tailwind v3 overrides pass. Automatic runtime styling, tested Next SSR/hydration/late delivery and concurrent themes pass. Eighty matched browser runs show no material total-time regression in the bounded paced replay; a Button entry adds 2,802 gzip JavaScript bytes, excluding baseline CSS.

Remaining issues are concrete: Tailwind v4 layered overrides and ordinary hover-utility precedence still fail in both original and runtime styles. A separate layer diagnostic fixes v4 with an explicit layer order but breaks v3 preflight, so a universal layering policy is not established. The short server diagnostic completes 8,000 measured renders; 2,000 distinct runtime themes retain about 42.07 MiB without a plateau. A separate SSR-only control keeping theme variables inline reduces this to about 1.35 MiB while retaining component Goober styling; it is not an accepted change and still needs browser/hydration/CSP validation. Portal/nested/dark themes, full runtime chat-shell integration and broader package coverage remain open. These count-based diagnostics do not replace the earlier twenty-minute static soak.

Styling remains reopened; review the evidence and consumer customization contract before implementation tickets. All package/component/ownership decisions and historical prototypes remain preserved.

### First runtime experiment — unresolved, not accepted

The [focused runtime report](https://github.com/ankit-thesys/openui-comp/blob/8ab2681bf8814d4c3eaaa2ff2afd706255583e94/packages/react-ui/prototypes/styling/runtime-investigation/results/RUNTIME-INVESTIGATION.md) records a separate actual-component prototype at `8ab2681b`. The final library-owned React 19/private-target adapter compiles Goober during render and passes standalone import-only base styling, SSR/hydration, tested theme isolation and delayed Table delivery. Twenty measured real parser/SSE chat/dashboard runs pass final-content and sampled resting-style parity; five pairs per workload are too few for a strong latency claim. A Button-only entry adds 2,760 gzip JavaScript bytes versus baseline JavaScript, excluding baseline CSS, and an unused import is removed. These are distinct bundle/emission tests, not full-library tree-shaking certification.

The candidate **fails ordinary host overrides in plain CSS and Tailwind v3/v4, and changes Button hover behavior**. An earlier `:where(&)` adaptation left components unstyled; its failed sources/results are preserved. The current adapter's selector/conversion limitations do not establish that all runtime Goober designs are unsuitable. Portal styles, arbitrary-theme cache bounds, nested/dark theme coverage, a runtime soak and broader package-install/root-export coverage remain open. The static prototype and all prior measurements remain intact.

Neither runtime nor static is accepted. Review these findings together before deciding a targeted runtime repair or component-level static-import comparison. Migration implementation tickets remain paused.

## Question and consumer contract

Can actual OpenUI components bring the styles they use through runtime Goober, with acceptable correctness/payload/performance and no consumer CSS import, styling setup command, styling-only provider or consumer build plugin?

React 19, Chrome, plain CSS and Tailwind v3/v4 are the target. Use actual component implementations, OpenUI schemas/Renderer and progressive parser replay. Chat and dashboard have equal priority. The old package is the baseline; the prior Goober-generated static prototype remains a separate comparison artifact.

## Candidate and controls

1. **Existing baseline:** existing components and their normal compiled CSS; record its explicit baseline integration. Do not give the runtime candidate that stylesheet.
2. **Runtime candidate:** component-owned style descriptor objects passed to Goober at render time. The runtime bundle genuinely contains the Goober engine. A library-owned private-target adapter may emit React 19 style resources for automatic SSR/hydration/delayed delivery. Record that adapter's code, cost and assumptions separately from stock Goober.
3. **Preserved static evidence:** commits `4092ca6c` and `faec2290` on `codex/prototype-styling`, including parity/browser/SSR and twenty-minute soak results. Do not overwrite these files or compare old and new timings as if they were a fresh matched run.
4. **Deferred alternative:** component-level static CSS imports under ordinary bundlers. This may provide automatic styling without a custom scanner; it has not been fully validated. Do not claim it either passes or fails from other arms.

Start with real Button, Input, Card and a real table/chart dashboard slice plus shared theme support. Use a finite, reported subset of the production library if necessary; disclose missing families rather than substituting mock UI. A one-time SCSS conversion can establish equivalent descriptor inputs for this spike, but the running candidate must compile those objects through Goober during render, not serve precomputed Goober CSS. It is not the full source migration.

## Gates and measurements

| Gate | Experiment | What counts as failure or a limitation |
| --- | --- | --- |
| Automatic styling | Production consumer imports components only; inspect its entry and network resources | Required manual component CSS, setup/plugin/registry or concealed aggregate CSS fallback |
| Usage and bundles | Component-only root/subpath import; imported-but-unused component; delayed chart import; inventory JS/CSS inputs and raw/gzip bytes | Unrelated chart/kit code or styles retained; distinguish installed bytes, emitted route chunks and actually transferred/emitted styles |
| Host coexistence | Plain CSS and real compiled TW3/TW4; consumer background/padding/hover overrides, before/after delayed component mounting, separate host Goober rules | Host rules modified, unexpected precedence/first-render order dependency, wrong hover/default styles |
| SSR and streaming | Production Next initial HTML without JS; delayed Suspense component first-use styles; inspect distinct response chunks | Missing early styles, flash at first observed reveal, all styles preloaded while claiming component-lazy delivery |
| Hydration/navigation | Same route after hydration, input interaction, local theme change, route/mount cycles | Mismatch/errors, duplicate/unbounded style resources, lost interaction |
| Themes/concurrency | Light/dark/custom and nested themes; parallel red/blue SSR streams; unique request markers; abort some requests | Theme leakage, global request collectors, one request clearing another's styles |
| Streaming correctness | Deterministic progressive actual OpenUI parser/Renderer response for chat/dashboard | Missing final content, wrong table/chart output, errors; unsupported scenarios explicitly unavailable |
| Performance | Fresh matched production baseline/runtime runs; same data, schedule, versions and machine; alternate arms, distinguish cold/warm | Material repeatable latency/catch-up/input regression or growing styles/retained memory; small noisy timing changes are inconclusive |

For a focused performance round, use at least five measured alternating pairs per workload after warmups; report that this is exploratory, not a production SLO. Capture render/stream duration, update latency proxy, parser timing if available, generated style counts/bytes, runtime invocation count and payload delta. Use fixed workloads and final-output checks. Investigate relative changes above 10% with an absolute floor (16 ms for update proxies, 50 ms for total small-workload comparison); collect more pairs if interpretation depends on noise. No successful performance verdict when correctness fails.

Concurrent SSR and a short repeated-mount diagnostic are distinct from the prior twenty-minute static soak. Report the exact runtime duration and counts; do not transfer the static soak pass to runtime. Large/hour-long conversations, every chart/browser and strict CSP are not certified by this focused experiment.

## Important implementation constraints

- JavaScript tree shaking and runtime style generation are separate. Deferred emission does not prove unused modules leave the bundle.
- Stock Goober documents SSR extraction. Any zero-setup SSR behavior demonstrated here belongs to the OpenUI-owned adapter and React 19 integration.
- Avoid a shared global stylesheet collector for request-specific styles; use private targets. Test concurrent interleaving rather than sequential requests only.
- Use finite style definitions and CSS variables for theme values where possible; inspect whether dynamic values expand the Goober cache. Record module cache behavior.
- Do not mutate host Goober setup/prefixing or styles. If runtime isolation needs a private bundled instance, measure and disclose it.
- Changes to selector specificity/cascade during conversion must be checked against the existing baseline; no `!important` patch or blanket reset to force a pass.
- Runtime app fixtures must not secretly choose a framework-specific library variant or insert a stylesheet-order declaration. If a workaround is necessary, label it and keep the unadapted result.

## Output and decision

Produce runnable prototype source, a concise result table, raw machine-readable results, source/version provenance and explicit passed/failed/unavailable states. Separate automatic styling, compatibility, SSR safety, bundle efficiency and performance verdicts. A failed implementation is not proof that every runtime design is unsuitable.

The final decision requires the user to review the results. Outcomes may be runtime with an owned adapter, a revised runtime experiment, a component-static-import comparison, or the previous static route with explicitly accepted setup tradeoffs. No outcome is preselected.
