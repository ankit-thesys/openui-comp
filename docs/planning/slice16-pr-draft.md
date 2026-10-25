## Summary

```text
@openuidev/kits
├── /react/chat       ModelSwitcher, FollowUpBlock, FollowUpItem
│   └── react-ui-core (components + shared theme)
└── /react/chat/libs  openuiChatLibrary + chat prompt options
    ├── react-ui-core (reusable UI + charts)
    ├── local follow-up components
    └── react-lang (schemas, parser, renderer, actions)
```

## What

Add the approved React chat kit with separate component and AI-library imports,
preserving existing props, positional schemas and actions. Related fork issue:
https://github.com/ankit-thesys/openui-comp/issues/16. Stacked on draft PR37.

## Changes

- Publish-ready ESM/CJS package and declarations for the two approved subpaths.
  Component-only imports do not assemble the AI library.
- Existing chat components use stock Goober and public core/theme imports.
  The existing chat library, groups and prompt data render through core.
- Restore the legacy Card's 12px unthemed spacing fallback and ModelSwitcher's
  effective hover/open border reset with ordinary CSS declarations.
- Require tested Zod 3.25.76 or the accepted Zod 4 range. Zod 3.25.0's published
  artifact lacks zod/v4 files; no dependency or legacy source was patched.
- AgentInterface, standalone helpers and assembled general openuiLibrary remain
  excluded. No new styling API, manual CSS import or consumer setup plugin.

## Evidence

- **Before:** missing public kit imports, unthemed Card gap `normal`, and an
  accepted-but-broken Zod 3.25.0 peer. **After:** real public-import, Chrome gap
  and strict npm peer-resolution regressions pass; minimum 3.25.76 consumers pass.
- **Before:** installed 8405 had 42/330 strict style-state failures from the model
  border cascade. **After:** corrected 9fc passes 36 focused framework/order/theme
  cases and 192 paired strict comparisons. Independent verification separately
  passes 6 framework/order cases and 360 observations, including exposed borders,
  consumer overrides and arm-specific dark logos. These counts are different
  measurement units and are not summed as distinct scenarios.
- One intermediate nested fixture self-resolved workspace kits against installed
  core. Its failure remains invalid-fixture evidence. Conventional standalone
  manifests and compiled module-origin guards now prove installed-artifact use.
  The older W2 run5 graph was separately audited as installed; its bounded
  behavior completion and original style failures retain their old provenance.

## Test Plan

- [x] Package CI 7/7; format/lint/types/build/Publint/ATTW pass. Six inherited
  renderer hook warnings, zero errors.
- [x] Normal packed ESM/CJS imports, strict Bundler/NodeNext ESM/NodeNext CJS
  consumers, component-only retained-byte pruning and unsupported-peer rejection.
- [x] Actual parser chunks and Renderer forms: streaming disables interactions,
  validation, submission/follow-up actions, saved history and clear/unmount.
- [x] Corrected library browser 6-case gate verifies actual CSS readiness/order,
  settled hover, active-stream cancellation, retry, markdown/table/painted charts,
  actions, scoped themes and portal selection. Independent 6-case functional and
  transport/timer-cleanup/math checks and 3 asset consumers also pass on 7ad.
- [x] Final 9fc affected-state matrix 36/192 and independent 6/360 pass. Only four
  model-style JS/map files differ from 7ad; all other 562 kit files and core remain
  byte-identical. Exact archives, installed files, fixtures, locks and raw failures
  are retained under packages/kits/evidence/chat-library and component tests.
- [ ] Fork remote build/changeset checks after draft creation.

## Costs and limits

Independent measured assembled-library cost: approximately 1.90 MB JS raw / 572 KB
gzip and 218 KB injected CSS. Unused/FollowUpItem-only builds emit 1.07 MB font
assets but download no CSS/fonts, retaining the accepted KaTeX build-output
limitation. These are bundle/download measurements, not a comparative performance
regression result. #17 performance/memory acceptance and SSR remain separate.
Browser target is Chrome with plain CSS/Tailwind v3/v4. Parent core's inherited
HorizontalBar default string-height/legend-fit strict comparison remains unpassed;
this PR does not recertify the whole chart set or claim unconditional parity.

Independent originals: /private/tmp/openui-chat16-independent-verification/
report.md, model-border-verification.md, border-browser-results.json and
border-final-artifact-proof.json. Exact snapshots, original paths and hashes are
committed under packages/kits/evidence/chat-library/independent-verifier/.

## Checklist

- [x] Fork issue linked without closure instruction
- [x] Release note, documentation and independent evidence updated
- [x] Existing public contracts and backwards compatibility considered

## Merge Danger

**Door:** two-way. **Blast Radius:** kits. Draft only, stacked on PR37.
No merge, publication, deprecation or issue closure is authorized.
