---
status: reopened
date: 2026-10-23
---

# Goober styling execution model — reopened

## Current status

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


Reopened by the user on October 23, 2026. Earlier acceptance was based on understanding the design as runtime Goober with automatic component styling; the tested implementation was build-time static CSS with setup tooling. That acceptance is withdrawn. Neither model is accepted until the runtime experiment is reviewed together. Preserve all package/component/ownership decisions and the prior static evidence. Do not create migration implementation tickets yet.

The intended consumer experience is install-and-import, no manual CSS imports, preferably no setup command or consumer build plugin, minimal unused payload, Chrome/plain CSS/Tailwind v3/v4 compatibility, and safe SSR/hydration/streaming with isolated themes/concurrent requests. See [the runtime prototype plan](../planning/goober-runtime-prototype-plan.md) and [current specification](../specs/react-ui-extraction.md).

Runtime style generation and bundler tree shaking are different mechanisms. Static measurements neither benchmark nor disqualify runtime Goober. Component-level static CSS imports may also support automatic styling; that path remains unvalidated. Existing prototype reports remain unchanged.

First runtime pass: [measured report](https://github.com/ankit-thesys/openui-comp/blob/8ab2681bf8814d4c3eaaa2ff2afd706255583e94/packages/react-ui/prototypes/styling/runtime-investigation/results/RUNTIME-INVESTIGATION.md). Automatic base styling/SSR is demonstrated, but host overrides and hover parity fail. No acceptance or implementation-ticket authorization follows.

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

## Historical decision — withdrawn

The user accepted Goober-generated static styling after reviewing the prototype compatibility, real OpenUI streaming, production Next SSR/hydration and memory results. Use Goober during the package build; consumers receive static CSS and stable classes with no render-time Goober generation or runtime injection. Dynamic theme values retain the existing CSS-variable/inline-style contracts. React 19 is the minimum for the selected integration.

OpenUI owns deterministic compilation, source manifests/generated documentation, automatic stylesheet delivery, SSR theme-token support and framework compatibility. Core owns reusable component/chart styles and the shared theme; kits own their use-case component styles and libraries.

The automatic setup path integrates early external CSS, using unlayered output for plain CSS/Tailwind v3 and the components layer for Tailwind v4. Host styles remain untouched. Setup must be idempotent and safely report ambiguous or customized inputs. It is a limited styling integration, separate from the future general source registry.

## Historical rationale and static evidence

The user needs traceable, agent-compatible styling without manual consumer CSS ordering or server extraction. Choosing Goober alone does not supply those capabilities; OpenUI's integration tooling does.

The [real performance comparison](https://github.com/ankit-thesys/openui-comp/blob/4092ca6ccab3e25784cf6accd9c6f4ade3a41ec5/packages/react-ui/prototypes/styling/results/REAL-PERFORMANCE.md) preserves 7,825 declarations, uses identical client JavaScript without a Goober runtime and shows no material regression in 72 bounded browser runs. The [follow-up validation](https://github.com/ankit-thesys/openui-comp/blob/faec229073d033817f3963b7e171ecfbe25c00fd/packages/react-ui/prototypes/styling/results/INTEGRATION-VALIDATION.md) passes full chat integration, actual Next SSR/hydration, combined Next chat and a twenty-minute bounded memory soak. These results justify the architecture, not a blanket compatibility or leak-free claim.

## Historical consequences — not current requirements

OpenUI maintains the ordered conversion/compiler checks, automatic setup and SSR theme helper. Loading CSS before delayed content costs upfront CSS bytes. The accepted scope requires a full one-to-one SCSS-to-Goober conversion for every extracted component and required shared style support. The new packages own their converted definitions and build without Sass or any old react-ui SCSS/CSS source or artifact inputs. A one-time conversion tool may assist migration; the old package may be compiled independently for comparison. A retained SCSS adapter or copied legacy stylesheet does not complete the conversion. The newly extracted packages must repeat parity checks because the prototype did not rewrite every component's style source.

Strict CSP for dynamic themes, full chart/portal coverage, Firefox, slow-network behavior and deployment-specific capacity require explicit validation or a declared support limitation. Runtime Goober generation is outside the accepted approach. Full style-source conversion is required, but its correctness must be established by extraction-specific parity checks; prototype results do not certify an unimplemented port.

This supersedes the unaccepted Sass-only proposal and earlier prototype delivery experiments. It does not change component boundaries, move AgentInterface, approve publication or deprecate existing react-ui. The [draft specification](../specs/react-ui-extraction.md) owns the implementation requirements and review items; [historical findings](../planning/goober-evaluation-history.md) preserve the investigation.
