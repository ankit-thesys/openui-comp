## Summary

```text
@openuidev/kits
├── /react/chat       ModelSwitcher, FollowUpBlock, FollowUpItem
│   └── react-ui-core (components, shared theme)
└── /react/chat/libs  existing openuiChatLibrary + chat prompt options
    ├── react-ui-core (all reusable UI and chart rendering)
    ├── local chat follow-up components
    └── react-lang (schemas, parser, renderer, actions)
```

## What

Add the approved React chat kit with separate component and AI-library imports.
Related fork issue: https://github.com/ankit-thesys/openui-comp/issues/16.
Stacked on draft PR37; legacy packages remain unchanged.

## Changes

- Publish-ready `@openuidev/kits` metadata, ESM/CJS declarations, two explicit
  subpath exports and conventional TypeScript fallback resolution.
- Existing ModelSwitcher and follow-up component APIs, with stock-Goober styles.
- Existing chat library definitions, positional schemas, component groups,
  prompts/examples and action semantics, using public core components.
- Kit-owned Icon wire schema, preserving name/category order. No general
  assembled openuiLibrary, AgentInterface or deferred standalone chat helpers.
- Zod 3 peer minimum is narrowed to validated 3.25.76, preserving the accepted
  Zod 4 range; the originally advertised 3.25.0 lacks its zod/v4 files.
- Ordinary 12px CSS-variable fallback restores the chat Card's legacy default
  spacing when no ThemeProvider supplies variables.

## Evidence

The public-import test failed before the package existed. A real isolated
no-provider Chrome check then exposed missing Card spacing (`normal` instead
of 12px); the conventional fallback restores the existing default. Original
red logs and exact packed archive/installed consumer manifests are retained.

The first complete package run found a test race: packing the existing runtime
executed its prepare build while another test imported it. The pack test now
uses standard ignore-scripts configuration to test built artifacts. No runtime
or dependency implementation was patched.

The peer-range regression first failed because npm accepted unsupported exact
Zod3.25.0 with the original artifact. Corrected metadata rejects it through
normal strict peer resolution. The new artifact changes only package.json and
README; all runtime/declaration bytes remain identical to source8405.

## Test Plan

- [x] Package CI: 7/7 public tests, formatting, semantic lint, types, build,
  Publint and ATTW. Six inherited library-renderer hook warnings; zero errors.
- [x] Normal packed consumer: native ESM/CJS imports, strict Bundler/NodeNext
  ESM/NodeNext CJS declarations and component-only retained-byte pruning.
- [x] Actual public streaming parser: arbitrary chunks preserve table/chart
  positional contracts. Renderer checks streaming-disabled forms, validation,
  submission/follow-up actions, saved form restoration and clear/unmount.
- [x] Corrected minimum Zod3.25.76: native imports, strict three-mode declarations
  and actual parser/Renderer form/action/history checks. Corrected package CI
  includes the npm peer-rejection regression.
- [ ] Final browser acceptance: previous production-Vite six-case matrix passed
  actual HTTP streaming, markdown, table/two painted bars, forms/actions,
  themes/portal selection, explicit overrides, cancel/resubmit and cleanup.
  Final review requires rerunning stricter settled-hover, verified stylesheet
  order and observed-live-cancellation assertions before counting this gate.
- [ ] Independent Worker2 component browser evidence, then verifier evidence.
- [ ] Final review of integrated evidence and fork remote checks.

## Compatibility and limits

Chrome; plain CSS and Tailwind v3/v4. Preserve existing customization APIs;
explicit important overrides remain available. No new sx/styling API, custom
Goober runtime, user CSS import or consumer setup plugin was introduced.
SSR/hydration and #17 performance/memory/soak certification remain deferred.
Existing core HorizontalBar default string-height/legend-fit strict comparison
remains unpassed; this PR does not recertify the entire chart set.

## Checklist

- [x] Fork issue linked without closure instruction
- [x] Release note and scoped documentation added
- [x] Existing props, schemas/actions and backwards compatibility considered
- [ ] Independent browser/verifier acceptance and final integrated review

## Merge danger

**Door:** two-way. **Blast Radius:** kits. Draft only, stacked on PR37.
Do not merge, publish, deprecate or close migration tickets from this checkpoint.
