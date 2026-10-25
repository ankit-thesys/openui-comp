# Slice12 stacked draft preparation

Title: Extract text, media, sources and tables into React UI core

Base: `codex/react-ui-core-layout` ([fork PR33](https://github.com/ankit-thesys/openui-comp/pull/33)); head: `codex/react-ui-core-text-media`. The user authorized opening/pushing a stacked DRAFT after integrated checks and independent review pass. No merge or ticket closure. Current sourcea28833480 and local CI are green; Worker2 review is pending. Copy the body below after updating its independent result.

## What

Add the approved text, media, source/citation and table families to the new core root import, preserving their public APIs and intended behavior. Existing react-ui remains read-only. Relates to [issue12](https://github.com/ankit-thesys/openui-comp/issues/12); stacked on #33.

### Summary

```text
@openuidev/react-ui-core
├── Table / ScrollableTable / CodeBlock
├── Markdown / headers / TextBlockView / math text wrapper
├── images / gallery / tags / callouts / icon-image text
└── source context / citations / URL helpers
```

## Changes

- Convert owned styles to stock runtime Goober without legacy SCSS. Preserve existing selectors, props and customization. Authored terminal `:where` selectors retain legacy specificity without modifying Goober's parser.
- Deliver the user-accepted unmodified KaTeX CSS/fonts through the existing lazy math pipeline and ordinary dependency imports. Stable tsdown config is unchanged; no experimental CSS plugin, CDN, injector or custom pruning.
- Validate automatic styling in default Vite6.4.2. Accept about1.07MB unused emitted fonts with zero unused network downloads; bare esbuild needs asset loaders/CSS linking. Keep other owned styles in Goober. See `docs/specs/react-ui-extraction-styling.md`.
- Use supported SyntaxHighlighter theme-data bundling and include its MIT notice. Move the wrapper's preserved behavior assertions into a real normal-installed Vite/Chrome test, with CSS/font checks; esbuild JS/Goober pruning tests explicitly externalize vendor CSS.

## Test Plan

### Evidence

**Current integrated artifact:** production `a288334807643bdc63acb75c08af3e7aef7d759e`,401873 bytes, SHA256 `8709be66bc8b6b5ffd859b3df4fda1507ee63f9b7a75506c149a2aaf56012537`. Exact normal npm artifact/lock/file manifest and logs: `packages/react-ui-core/evidence/katex-integration/`.

- [x] Full local package CI97/97, including executable packed Vite/Chrome math styling and existing behavior checks; format/lint/types/build/Publint/ATTW.
- [x] Native ESM/CJS and strict TS5.9.3 skipLibCheck:false consumer declarations in Bundler/NodeNext ESM/NodeNext CJS. Direct CSS vendor and renderer both0.16.47.
- [x] TDD: previous88fd artifact fails automatic math typography; the minimal integration passes without weakening the assertion. Both independent local source/test review axes report zero actionable findings.
- [ ] Worker2 independent integrated delivery review/result — update before opening.

**Earlier artifacts, not a combined final run:** non-math Table/text6 cases /22,296 snapshots and composers6 /30,012 at88fdccf94; source/presentation12 /22,056 at680118396; fixed media6 /8,292 at96221894a. Their exact artifacts and first failures remain archived. Unchanged matrices were not repeated or relabeled. Comparisons establish settled endpoints, not intermediate animation timing.

## Merge Danger

**Door:** two-way. **Blast Radius:** core. New-package additions are reversible; no legacy migration, publication or deprecation occurs here.

Inherited limitations remain disclosed: pinned Citation Escape dismissal/public trigger onClick; Gallery focus remains on BODY and overflow cleanup sets auto; inline GFM alignment uses legacy inline textAlign; CodeBlock retains clipboard-rejection/timeout cleanup behavior. Parent Tooltip truncation/ref and Modal accessibility limitations are unchanged. See family evidence for baseline comparisons; these are not accessibility certification or new fixes.

SSR/hydration/streaming SSR/concurrent server isolation, final migration performance/memory, arbitrary bundler zero setup and universal accessibility are outside this evidence. The vendor-style exception and output costs are explicitly accepted. No custom runtime patch, merge, release, ticket closure or upstream write.

## Checklist

- [x] Related issue linked without an auto-close keyword.
- [x] README and accepted styling spec updated.
- [x] Backwards compatibility considered; legacy/read-only and inherited limitations preserved.
