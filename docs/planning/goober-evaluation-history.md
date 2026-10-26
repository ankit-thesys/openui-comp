# Goober evaluation history

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


Historical record through October 24, 2026. Statements such as “pending” describe the decision at that point in time. The user subsequently accepted build-time Goober/static CSS, then withdrew that acceptance after clarifying the intended runtime experience. The execution model is reopened; neither runtime nor static is currently accepted. For the current decision, read [ADR 0004](../adr/0004-goober-static-css.md); for implementation requirements, read [the draft spec](../specs/react-ui-extraction.md). Earlier delivery experiments are not the selected production contract.

## Original CSS proposal and successive experiments


This section is a recommendation for discussion, not an accepted implementation decision. The earlier Sass proposal below remains unaccepted; the subsequent Goober evaluation records the newer requirements and evidence.

### Preserve the existing styling system

Keep Sass source compiled to plain CSS during the package build. Preserve existing openui-* class names, --openui-* custom properties, theme behavior, and CSS side-effect metadata. Consumers import built CSS explicitly and do not need Sass tooling. Do not introduce a styling rewrite into this extraction.

### Ownership and consumption

- Core owns theme defaults/tokens, ThemeProvider and hooks, shared Sass utilities, and all selected reusable component and chart styles.
- The chat kit owns only the styles for its selected components: ModelSwitcher, FollowUpBlock, and FollowUpItem. It consumes the core theme context; do not copy a second ThemeProvider into the kit.
- The app imports the full core stylesheet once, then the chat stylesheet if using the chat kit. The chat stylesheet does not embed core's aggregate CSS or duplicate its token defaults.
- Rebuild each package's aggregate stylesheet from its selected components. The existing react-ui aggregate includes AgentInterface and other excluded UI, so copying it unchanged would violate the boundary.
- Preserve the current unlayered default and opt-in layered artifact conventions. Keep per-component CSS exports; document that composed components require their dependencies' CSS too. Full core + chat imports are the initial simple consumer path.
- Exact chat package name and stylesheet export path remain open. No combined convenience stylesheet is required unless agreed separately.

### Verification

Compare old and new in isolated fixtures/documents so shared global selectors cannot conceal missing styles. Verify core alone and core plus chat, light/dark/custom themes, portal overlays, chart styles, full CSS imports, and supported per-component/layered imports. Chart and UI props/appearance/behavior preservation still applies. This does not expand scope to arbitrary mixed old/new component trees or promise shared context identity between old react-ui and new core.

### Current-code evidence

- packages/react-ui/src/components/Button/Button.tsx: global component class names.
- packages/react-ui/src/scripts/generate-css-utils.ts: shared Sass bindings and theme-default generation.
- packages/react-ui/src/components/index.scss: existing full style aggregation.
- packages/react-ui/cp-css.js and css-layer-utils.mjs: aggregate, per-component, and layered CSS artifacts.
- packages/react-ui/package.json: CSS exports, sideEffects, and Sass build steps.
- packages/react-ui/src/components/ThemeProvider/ThemeProvider.tsx and Select/Select.tsx: scoped tokens and portal-theme support.

### Goober evaluation — decision pending

The requested direction is automatic component styling, component-to-source traceability, generated documentation/evidence, an agent-friendly workflow, and compatibility with Tailwind v3/v4 and other consumer CSS without disturbing host styles. These requirements are not satisfied merely by choosing a CSS-in-JS library.

A Goober-only throwaway prototype is captured on the fork at commit `e53e38e7`, branch `codex/prototype-styling`. See [the evaluation issue](https://github.com/ankit-thesys/openui-comp/issues/3), [runnable source](https://github.com/ankit-thesys/openui-comp/tree/e53e38e7/packages/react-ui/prototypes/styling), and [generated decision report](https://github.com/ankit-thesys/openui-comp/blob/e53e38e7/packages/react-ui/prototypes/styling/results/DECISION.md).

- Browser style injection, representative themes/portals, and chart updates passed.
- Across five CSS environments and two load orders, default Goober passed consumer overrides in 5/10 scenarios. A framework-aware adapter passed all ten base-style/override combinations, but a separate shared-Goober-host probe showed that its stylesheet movement changes host styling. That adapter is not production-ready.
- Classic SSR/hydration passed with explicit CSS extraction. A Next.js App Router development smoke test without a style registry had no initial server styles; styling appeared after hydration. SSR/streaming integration remains unresolved.
- Source metadata, generated reports, and structured manifests were implemented by prototype tooling; these are not automatic Goober features.

These initial findings cover representative components in Chromium, not production OpenUI ports or universal framework/browser compatibility. The follow-up below supersedes the host-conflict and missing-SSR observations for the revised prototype. No CSS rewrite is approved by either evaluation; the appearance/behavior preservation requirement still applies.

### Goober follow-up — isolated styles and automatic SSR

The revised prototype is captured at commit `c9c7cd7a` on the same fork branch. See its [generated report](https://github.com/ankit-thesys/openui-comp/blob/c9c7cd7a/packages/react-ui/prototypes/styling/results/DECISION.md) and [production Next.js evidence](https://github.com/ankit-thesys/openui-comp/blob/c9c7cd7a/packages/react-ui/prototypes/styling/results/NEXT.md).

- The browser adapter inserts a library-owned stylesheet generated by Goober during the package build. It no longer moves or modifies the host Goober sheet. The host-isolation probe and all ten adapted framework/load-order combinations pass.
- The automatic SSR component carries generated CSS through React 19 stylesheet resources. The consumer only imports/renders the component: no component CSS import, registry, provider, extraction call, or styling plugin.
- Plain React SSR/hydration and client-only rendering pass. Production Next.js checks pass for initial styles without JavaScript, hydration, streamed content, deduplication, host coexistence, client navigation, and eight concurrent requests with distinct theme values.
- These are two delivery paths over the same generated styles. The SSR fixture is framework-free, while the browser adapter still selects the framework policy explicitly. Automatic framework selection and combined SSR + Tailwind v3/v4 validation remain open.

React 19 is accepted by the user as the minimum for the proposed automatic styling path. Goober adoption and package-build-generated static styles still need final agreement after compatibility evidence, validation against real components, browser coverage, CSP/nonce handling, and distribution checks. The prototype uses CSS variables for dynamic theme values; it does not certify arbitrary runtime Goober style generation. Both blockers are resolved in the tested prototype paths, not universally for every host configuration.

### React 19 compatibility round — adoption remains pending

The next prototype round is captured at `be37f03d`: [installed-package compatibility matrix](https://github.com/ankit-thesys/openui-comp/blob/be37f03d/packages/react-ui/prototypes/styling/results/COMPATIBILITY.md), [CSP observations](https://github.com/ankit-thesys/openui-comp/blob/be37f03d/packages/react-ui/prototypes/styling/results/CSP.md), and [full generated assessment](https://github.com/ankit-thesys/openui-comp/blob/be37f03d/packages/react-ui/prototypes/styling/results/DECISION.md).

- React 19 acceptance is settled. Measurements use React 19.3.1; other minor versions have not been certified.
- A real npm tarball installs and builds in five standalone Next.js consumer apps. A setup command detects installed direct dependencies, chooses the CSS policy, generates the component entry point, repeats without changes, and refuses to overwrite customized content. This is a prototype configuration step, not approval of the future registry implementation.
- In Chromium and Playwright WebKit, the installed-package SSR cases pass with no framework and with Tailwind v4. Tailwind v3, Bootstrap, and plain CSS fail consumer-override, hover-override, and streamed-override checks. Base styling, hydration, interactions, navigation, and host isolation still pass. Four of ten executed browser/framework combinations pass completely.
- Next.js places the unlayered component stylesheet after the app stylesheet, so equally specific consumer classes lose priority. Automatic dependency detection does not resolve this. The earlier passing isolated-browser adapter must not be presented as evidence that this combined SSR case works.
- Five planned Firefox combinations could not run because Firefox failed to launch on this host. They are unavailable, not passes.
- Strict CSP works for the static component when its style hash is authorized, or when a matching style nonce is also passed to React's streaming renderer. A component nonce prop alone fails. Automatic application/Next.js CSP integration and dynamic inline theme attributes remain unresolved.

The automated full run records failures and unavailable checks with a nonzero exit status. Next work before Goober adoption: resolve SSR priority for unlayered consumer styles, define CSP integration, restore Firefox coverage, and validate actual OpenUI components and required React/browser versions. No production components or migration boundaries changed in this prototype round.


### Ordered stylesheet follow-up — automated installation

Prototype commit `09a336f3` supersedes the previous installed-package stylesheet-order failures for the new external stylesheet path. See the [generated decision report](https://github.com/ankit-thesys/openui-comp/blob/09a336f3/packages/react-ui/prototypes/styling/results/DECISION.md), [compatibility measurements](https://github.com/ankit-thesys/openui-comp/blob/09a336f3/packages/react-ui/prototypes/styling/results/compatibility.json), and [installer safety checks](https://github.com/ankit-thesys/openui-comp/blob/09a336f3/packages/react-ui/prototypes/styling/results/setup-safety.json).

- The installer generates static Goober CSS and inserts its import before existing root-layout imports. Installed components no longer emit late inline stylesheet resources. Tailwind v4 additionally receives the standard layer-order declaration. Users run setup and import the generated entry; no manual stylesheet ordering, provider, or SSR registry is required.
- All ten executed browser/framework combinations pass: Chrome and Playwright WebKit across plain CSS, Tailwind v3/v4, Bootstrap and no framework. Checks include initial SSR styles without JavaScript, hydration, overrides/hover, actual delayed response chunks, styled content at its first observed stream reveal, repeated mounts, navigation and preservation of host Goober styles.
- Eight installer safety checks pass, including JS/TSX layouts, directive/source preservation, idempotence, and refusal without changes for customized output, ambiguous roots or reordered generated imports. All five production consumers build from the installed npm tarball.
- Twelve executed CSP probes behave as expected. External static CSS works under `style-src 'self'` with no inline-style authorization. Application security policy, integrated Next.js streaming CSP and dynamic inline theme attributes remain outside this validation.
- Firefox still cannot launch on this host: five planned framework combinations are unavailable. The full command deliberately exits nonzero for this missing coverage; there are no failures among the executed compatibility/CSP cases. Earlier baseline SSR and host-isolation checks still pass.

The tradeoff is upfront loading of CSS for all installed prototype variants, including delayed components. This automates integration for conventional Next.js App Router layouts; it does not prove zero integration for all frameworks or support arbitrary runtime-generated CSS. Actual OpenUI parity, broader browser/layout support, registry/update behavior and final Goober/static-CSS adoption remain pending. Production migration scope and existing user decisions are unchanged.


### Performance validation — planned, not approved

Before adopting the Goober/static-CSS path, execute the [streaming performance and pressure-test plan](../planning/goober-performance-plan.md). Compare existing react-ui with a matched real-component candidate through both SSR streaming and the actual AI-response adapter/store/parser/Renderer pipeline. Compatibility passes are not a performance result.

A [bundle preflight](../planning/goober-performance-preflight.json) finds no Goober runtime in the standalone installed prototype entry, but both CSS-policy strings remain in its JavaScript alongside the external stylesheet. This is an optimization candidate to measure before scaling, not proof of a large user-visible slowdown. Full OpenUI latency, payload impact, server capacity and memory remain unmeasured. The plan defines deterministic replay, workload tiers, proposed budgets, repeated paired measurements, concurrency and soak checks; no production component migration or styling approval is implied.


### Wayfinder performance prototype — awaiting user feedback

The user confirmed equal priority for chat streaming and dashboard workloads. [The decision map](https://github.com/ankit-thesys/openui-comp/issues/4) tracks this evaluation. The [maintainability research](https://github.com/ankit-thesys/openui-comp/issues/5) concludes conditional viability for build-time Goober generation with OpenUI-owned integration; it does not approve adoption.

The [interactive performance prototype](https://github.com/ankit-thesys/openui-comp/issues/6) is captured at `a9f0eab2`, with a [test plan](https://github.com/ankit-thesys/openui-comp/blob/a9f0eab2/packages/react-ui/prototypes/styling/PERFORMANCE-PLAN.md), [hands-on guide](https://github.com/ankit-thesys/openui-comp/blob/a9f0eab2/packages/react-ui/prototypes/styling/PERFORMANCE-LAB.md), and generated smoke results. The local lab is http://127.0.0.1:4177/performance.html. Twelve smoke runs pass across both synthetic workloads and both arms in three CSS environments; these validate the lab, not a full-library performance budget. The control is an equivalent static React button, not the current react-ui package. Real component/parser replay, SSR pressure, route payload and soak tests remain pending. The prototype decision stays open for user feedback.


### Real OpenUI streaming and SSR diagnostic — adoption still pending

Prototype commit `4092ca6c` adds actual `openuiChatLibrary` components, the existing headless SSE adapter and incremental parser/Renderer. See the [measured report](https://github.com/ankit-thesys/openui-comp/blob/4092ca6ccab3e25784cf6accd9c6f4ade3a41ec5/packages/react-ui/prototypes/styling/results/REAL-PERFORMANCE.md), [method and limits](https://github.com/ankit-thesys/openui-comp/blob/4092ca6ccab3e25784cf6accd9c6f4ade3a41ec5/packages/react-ui/prototypes/styling/REAL-PERFORMANCE.md), [raw browser measurements](https://github.com/ankit-thesys/openui-comp/blob/4092ca6ccab3e25784cf6accd9c6f4ade3a41ec5/packages/react-ui/prototypes/styling/results/real-browser.json), and [raw SSR pressure measurements](https://github.com/ankit-thesys/openui-comp/blob/4092ca6ccab3e25784cf6accd9c6f4ade3a41ec5/packages/react-ui/prototypes/styling/results/real-ssr.json). Local interactive lab: http://127.0.0.1:4180/.

- 72 measured browser runs passed content/style invariants, with chat and dashboard equally represented. Native-speed five- and twenty-block/panel cases plus simulated 4× CPU five-block/panel cases were measured. The heavy dashboard contains 20 real D3 charts and 200 table rows. Paired median total-time changes range from approximately −1.8% to 0.0%; no material browser regression was observed in this bounded pass. Small apparent gains are not a proven speedup.
- The candidate generates static CSS through Goober at build time from ordered objects adapted from current Sass output. All 7,825 CSS declarations preserve value, order, importance and selector/condition ancestry. Gzip CSS changes by +7 bytes; JavaScript is identical and contains no Goober runtime. This is not a completed hand-authored CSS-in-JS port or a runtime-generation benchmark. A naive whole-stylesheet conversion failed parity, so the ordered conversion and parity guard are tooling we would own.
- Standalone React SSR passed 3,096 measured responses at concurrency 1/10/25/50, four separate-chunk canaries and ten cancellation checks. Actual components and request markers are verified; active requests drain to zero. SSR uses two blocks/panels and does not fetch CSS, hydrate, or validate theme CSS. It is not Next.js or a deployment-capacity result.
- SSR process RSS rose from 204.4 to 469.3 MiB across both arms. The short shared-process test does not distinguish retention from GC/allocator behavior or prove a leak; longer idle-checkpoint soak remains required.
- The user's earlier synthetic export has [a sanitized analysis](https://github.com/ankit-thesys/openui-comp/blob/4092ca6ccab3e25784cf6accd9c6f4ade3a41ec5/packages/react-ui/prototypes/styling/results/user-measurements-summary.md). Both dashboard arms took approximately 24 seconds for ten nominal seconds, showing saturation in both controls. One pair and unequal/no input activity do not establish a library-specific regression. The raw user export was not published.

Remaining adoption coverage includes the full chat store/shell, real Next hydration/theme CSS, cold load and slow networking, full-library framework/browser cases, sustained/open-loop load and a longer memory soak. No production migration or package-boundary decision changed. The [performance prototype decision](https://github.com/ankit-thesys/openui-comp/issues/6) remains open.


### Full chat, Next hydration and memory follow-up — requested checks pass

Prototype commit `faec2290` closes the three requested diagnostic gaps. See the [consolidated results](https://github.com/ankit-thesys/openui-comp/blob/faec229073d033817f3963b7e171ecfbe25c00fd/packages/react-ui/prototypes/styling/results/INTEGRATION-VALIDATION.md), [protocol and reproduction](https://github.com/ankit-thesys/openui-comp/blob/faec229073d033817f3963b7e171ecfbe25c00fd/packages/react-ui/prototypes/styling/VALIDATION-FOLLOWUP.md), and [combined Next chat evidence](https://github.com/ankit-thesys/openui-comp/blob/faec229073d033817f3963b7e171ecfbe25c00fd/packages/react-ui/prototypes/styling/results/NEXT-CHAT.md).

- Actual AgentInterface/ChatProvider/store integration passes four chat/dashboard × CSS cases, including composer, partial/final parser output, history, cancellation/resubmission, themes and cleanup.
- Production Next passes 33 real-component SSR/hydration/theme/framework checks. A separate combined Next chat route passes all four cases with actual composer/store/parser streaming and cancellation propagated through its Next proxy on navigation. The combined route tests default-theme shell SSR; custom component themes are covered separately.
- The twenty-minute bounded soak completes 6,940 Next SSR responses and 1,100 browser streams across baseline and generated CSS, including warmup. There are 12 SSR aborts and 120 pending-state browser cancellations. A separate 120-cycle test verifies cancellation after actual partial content and active HTTP streaming.
- Browser retained heap rises approximately 3.6 MiB in both CSS arms, below the 5 MiB investigation budget. Each workload also passes its individual budget. DOM, listener, stylesheet and rule counts stay unchanged; no live streams remain after teardown. Server retained heap remains below warmed levels. This supports these bounded paths, not a claim of leak-free hours/days or accumulating conversations.
- All nine aggregate gates pass, including hashes matching measured source/builds. Goober remains build-time static generation with unchanged production components, not runtime generation or a completed hand-authored port.

The demonstrated scoped SSR theme helper, framework-specific stylesheet delivery and explicit unmount cancellation must carry into migration. Cross-browser/full-chart coverage, strict CSP/portal themes, slow networks and deployment-specific rollout checks remain outside this result. The evidence supports a controlled migration of the tested approach; no production migration has started. The [performance prototype decision](https://github.com/ankit-thesys/openui-comp/issues/6) remains open for human acceptance.


### Detailed runtime follow-up — still unaccepted

The [deeper runtime investigation](https://github.com/ankit-thesys/openui-comp/blob/51077c9be7c016441e95acd456ff51ab6d95a3ca/packages/react-ui/prototypes/styling/runtime-detailed/results/DETAILED-RUNTIME-REPORT.md) supersedes the first pass's selector/hover findings for its tested slice: nested Goober objects preserve 293 selected selectors, actual Button states match the original, and normal plain CSS/Tailwind v3 overrides pass. Automatic runtime styling, tested Next SSR/hydration/late delivery and concurrent themes pass. Eighty matched browser runs show no material total-time regression in the bounded paced replay; a Button entry adds 2,802 gzip JavaScript bytes, excluding baseline CSS.

Remaining issues are concrete: Tailwind v4 layered overrides and ordinary hover-utility precedence still fail in both original and runtime styles. A separate layer diagnostic fixes v4 with an explicit layer order but breaks v3 preflight, so a universal layering policy is not established. The short server diagnostic completes 8,000 measured renders; 2,000 distinct runtime themes retain about 42.07 MiB without a plateau. A separate SSR-only control keeping theme variables inline reduces this to about 1.35 MiB while retaining component Goober styling; it is not an accepted change and still needs browser/hydration/CSP validation. Portal/nested/dark themes, full runtime chat-shell integration and broader package coverage remain open. These count-based diagnostics do not replace the earlier twenty-minute static soak.

Styling remains reopened; review the evidence and consumer customization contract before implementation tickets. All package/component/ownership decisions and historical prototypes remain preserved.

### Inline theme and automatic CSS follow-up — October 24, decision still open

The [new runtime follow-up](https://github.com/ankit-thesys/openui-comp/blob/d301886813dfe345cd24a9405fdbf18da7650699/packages/react-ui/prototypes/styling/runtime-inline-followup/REPORT.md) supersedes the previous inline-theme browser gap and demonstrates a bounded Button compatibility solution. Inline variables alone preserved SSR/hydration tokens but the original ThemeProvider still wrote to body. A library-owned stable theme scope removes that leak: 29 focused checks pass, including complete tokens, nested/dark/sibling themes, unchanged outside content, client navigation and concurrent documents.

The combined production Next prototype passes 85 recorded checks. Button defaults use a named CSS layer plus an internal, property-specific rollback guard; consumers supply no CSS import, framework flag, styling setup command or build plugin. Initial-shell SSR, hydration, default states, plain CSS/Tailwind v3/v4 normal and hover overrides, and delayed first-visible Button/Table styling pass. Twelve simultaneous distinct-hue requests retain their own tokens. CSS arrives after hidden streamed markup but before React reveals it; hidden no-JavaScript delayed content is not claimed as a visible rendering pass.

The separate Button matrix passes 24/24 state/order cases and 24/24 unrelated-sizing checks. A stricter disabled-cursor priority contract passes only 20/24: ordinary cursor utilities behave differently between v3/plain CSS and v4. Compatibility is demonstrated for Button only, with standard layer order; broader component/chart/full-chat coverage, portals, strict CSP and unusual host resets remain unproved. Stable resource counts across 120 theme changes are not a new long memory soak. This changed candidate has not repeated performance/bundle/long-soak measurements.

These are experimental library integration responsibilities, not an accepted Goober architecture. Styling remains **reopened**, migration implementation tickets remain paused, and package/component/ownership decisions and prior static/runtime evidence remain unchanged. Review the customization contract and broader coverage before acceptance.



### Expanded components, full chat and fresh measurements — October 24, decision still open

The [expanded runtime report](https://github.com/ankit-thesys/openui-comp/blob/c2ba24f390d5ebf14ba19178769bfda0a1005d6e/packages/react-ui/prototypes/styling/runtime-expanded/REPORT.md) supersedes the prior bounded Button/cursor findings for this new candidate. All 12 catalog configurations pass (plain CSS/Tailwind v3/v4 × two actual CSS orders × baseline/runtime), including the corrected disabled-cursor contract, sampled controls/portals and Bar/Line/Pie charts. Actual full-chat streaming and production Next checks pass within their documented scope.

This evidence uses **a private experimental Goober 2.1.19 parser patch**, required by actual complex selectors, plus a library-owned cascade guard serializer. It is not stock Goober certification or acceptance of a maintained fork. Full-document SSR/Next preserves styles; fragment SSR loses styles on unmount/remount and remains unsupported. The real SSR chat store is empty; a separately labeled actual Renderer/parser companion supplies SSR content, followed by actual HTTP chat after hydration. AgentInterface is only a test subject, not newly approved for extraction.

Fresh measured runs include 140 Renderer and 120 full-chat samples. Paced completion is close to baseline; saturated paired changes are +11.3%/+8.9% for chat/dashboard Renderer, +15.0% for expanded controls, and +3.1%/+7.0% for full chat. Cold local full-chat readiness adds about 48 ms. At 50 concurrent Next document requests, median repetition p95 rises from 658 ms to 1,406 ms. This test includes runtime inline CSS but does not fetch baseline linked CSS; it measures document delivery, not whole-page capacity. Full chat emits 1,500,896 CSS bytes and still aggregates all 47 selected style families, so minimal unused-style delivery is not established. The dedicated Button entry adds 3,942 gzip JavaScript bytes, excluding baseline CSS.

The fresh twenty measured minutes of server/browser soak (five minutes per arm in each environment) stay within the provisional retained-heap/resource investigation budgets, with no recorded errors or live browser streams after teardown. Runtime still retains about 4.6 MiB more JavaScript heap per browser page; terminal gross Chrome RSS is about 364 MiB above baseline and needs further native/process-memory investigation. RSS can count shared pages more than once and does not isolate CSS allocations. This is bounded evidence, not proof of leak absence or a small total memory impact.

Styling remains **reopened**. Review parser-patch maintenance, style payload/SSR cost, remaining SSR boundaries, package-install/tree-shaking proof, strict CSP and untested variants before accepting an approach or creating migration implementation tickets. Package/component/ownership decisions and historical static evidence are preserved. Read the linked report for exact coverage, raw results, failed attempts, limitations and reproduction.



### Component-owned runtime optimization — October 24, decision still open

The [new frozen prototype report](https://github.com/ankit-thesys/openui-comp/blob/a35351b9f7c3a7253d9aaf1a62907d7b85d3155e/packages/react-ui/prototypes/styling/runtime-component-ownership/REPORT.md) records ordinary component-level style ownership, lazy immutable compilation, native React resource delivery and the existing portal-theme API. It removes eager all-family chat delivery, repeated immutable compilation and the fake browser target. Full-chat inline CSS falls from 1,500,896 to 339,692 UTF-8 bytes (77.4%); a Button-only render emits 13,820 CSS bytes with no chart/shell styles. Correctness passes the twelve-configuration component matrix, actual full-chat integration, production Next SSR/hydration/streaming and concurrent theme checks.

Fresh measurements include 140 Renderer and 120 full-chat samples, 1,680 checked SSR responses including warmups, three fresh-process RSS pairs, and twenty measured minutes of server/browser soak. At concurrency50, median-repetition document p95 is 839 ms runtime versus 743 ms baseline; throughput is 69.7 versus 82.9 responses/s. Paced browser completion is near baseline, but unpaced full-chat dashboard remains 17.2% slower. Baseline linked CSS is not fetched by the SSR pressure client; these are document-delivery observations, not complete-page capacity estimates.

**Memory is not fixed:** matched retained JS heap, DOM/listener/style/rule budgets pass, but the long browser run ends with runtime gross Chrome RSS about 303 MiB above baseline and about 242 MiB above its own warm checkpoint. Short repetitions show the opposite terminal ordering, so attribution remains unresolved; renderer-process totals dominate the long-run growth. Do not infer a CSS leak or dismiss the signal.

The [standard/custom audit](https://github.com/ankit-thesys/openui-comp/blob/a35351b9f7c3a7253d9aaf1a62907d7b85d3155e/packages/react-ui/prototypes/styling/runtime-component-ownership/DESIGN-REVIEW.md) explicitly identifies the inherited private Goober parser patch, generated cascade guards and implementation-dependent server target. Stock Goober still fails the new Switch selector control. These are not accepted production practices. A supported engine/SSR contract, native-memory diagnosis, dashboard cost and remaining coverage require review. Styling remains **reopened**; no migration implementation tickets, production migration or package/component/ownership changes. Historical static and runtime evidence remain preserved.

