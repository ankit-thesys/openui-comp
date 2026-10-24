# Layout, containers and overlays — slice #11

**Ready for review.** Production integration `66547405c`; final browser runner `135da0d8f`. Cards, sections, separators, Accordion, Carousel, Steps, Tabs, loading components, Modal and TooltipWrapper are exposed through the package root with existing public parts/types.

Final combined CI passed 64 tests; normally installed public tests passed 53; strict types passed all three module modes. The final overlay matrix passed 12 cases /4,674 snapshots. The earlier container matrix passed 30 cases /132,051 snapshots and loading animations. See [final overlay evidence](evidence/layout-overlays/README.md) and [container checkpoint](evidence/layout-containers/README.md) for exact artifacts, versions and scope.

Inherited Modal focus/label behavior and Tooltip ref/composed-dismissal observations require explicit review. They are not repaired or presented as successful accessibility behavior. SSR and runtime performance/memory certification remain deferred. Old package source remains unchanged; stock Goober only.

## Historical implementation notes

The following notes describe the earlier container checkpoint; final combined results above supersede earlier counts.

# Layout slice (#11)

Base: `bd4c4270e` (reviewed #30 plus orchestration record). Branch:
`codex/react-ui-core-layout`. Parent specification: fork issue #7; task: #11.
User authorized implementation in two phases: containers/cards first, overlays
only after an integrated container checkpoint. Legacy React UI is read-only.

## Ownership

Worker 1 owns Card/CardHeader, SectionBlock, Separator, Skeleton and
DotMatrixLoader, plus shared root exports/dependencies/lockfile/integration.
Worker 2 owns Accordion, Carousel, Steps and Tabs; Modal/TooltipWrapper follow
the container gate. Integrate only its committed source batches. Friend baseline
paths and untracked crates are outside this work.

## Public validation boundary

Continue the agreed built/packed root-import React DOM/browser seam. Each owned
family first failed as a missing public export, then passed real React consumer
behavior: native refs/props and updates; CardHeader action forwarding and existing
styles/style precedence; Separator semantics/orientation; controlled FoldableSection
expansion, native trigger and no nested button; SectionV2 content; Skeleton bar,
table and pie/donut dimensions; DotMatrix accessibility/grid/size/animation.

The shared JSDOM consumer now uses its ordinary pretendToBeVisual option and
exposes its real browser APIs for Radix/animation. No product/browser APIs are
mocked. Separator's decorative semantics are checked with explicit decorative=true
rather than assuming that prop's default. Animation timing differences are not
production defects: Chrome will compare CSS animation parameters and matched
animation phases, and separately verify the JS loader under Playwright's normal
clock controls.

Styles use stock module-scope Goober css/keyframes and normal native/Radix JSX.
Skeleton's public variants are in separate modules so unused table/pie styles can
be pruned. Existing props/behavior and style customizations are preserved; no new
sx API, parser/cache/bridge, generated runtime or old SCSS dependency. SSR remains
deferred. All phases require normal installed-package imports, strict types,
unused JS/styles, isolated build, CI and Chrome plain CSS/Tailwind v3/v4 both
orders with theme/state/override checks. Inherited issues will be reported
separately rather than silently redesigned.

## Current checkpoint: passed

Validated revision `d88873401d68b8133ec7e0659608ef353f6b2eb0`; last production change `94dca6196`. The archived normally installed tarball matches current dist byte for byte, contains no CSS/SCSS files, and has SHA256 `fae423c3822f8884aa1e2ea7b1e47becc0e875bc56653484b563cd0102828b5a` (234,156 bytes).

Final core CI: 57/57 tests, formatting, lint, types, isolated build, packed consumer, publint and attw passed. Two inherited ThemeProvider hook warnings remain; zero lint errors. Installed public tests: 46/46. Strict skipLibCheck=false consumers passed Bundler, NodeNext ESM and CJS. Empty strict-type logs indicate successful commands, not additional tests.

Chrome 156.0.8078.47: six all-ten-family composition configurations passed 93,933 paired snapshots; 24 interactive cases passed 38,118. Total 132,051 snapshots. Plain CSS, Tailwind v3/v4, both orders, themes, states, overrides, keyboard and responsive checks passed. Loader default/compact matched RAF phases, Skeleton pulse and unmount passed. Counts measure coverage, not runtime overhead.

Workspace Radix Accordion 1.2.20/Tabs 1.1.21 and fresh consumer 1.3.1/1.2.1 passed scoped checks. React 19.2.4 and stock Goober 2.1.19. This is not exhaustive certification of all dependency versions.

## Standards review

Independent GPT-6.1 Sol review: zero actionable findings. Stock public Goober css/keyframes, conventional React/Radix code; no custom runtime patches or legacy edits. Test-only follow-up review also passed.

## Spec review

Independent GPT-6.1 Sol review: zero actionable findings for the ten container/loading families and public parts/types. Overlays remain separate phase 2. No SSR, performance or memory-soak certification is claimed here.

## Retained failed synchronization run

The retained interactive-unsettled files show a closing Accordion wrapper mismatch. Commit d88873401 adds a bounded wait for the public hidden state after finite animations; it neither mutates nor filters product DOM. No product code changed. The full final matrix passed on the same tarball. This verifies settled endpoints, not intermediate animation timing.

## Inherited limitations

CarouselContent ignores its forwarded ref as in legacy; CarouselRef remains available. Carousel arrow buttons retain their existing required icon prop. Steps inherits typography because the old Sass map emits no corresponding title rule. SSR/hydration/concurrent server isolation are deferred. Legacy packages remain read-only.

Raw logs, matrix JSON, TDD red/green logs, consumer lock, source/build hashes and exact tarball are archived alongside this document. Browser runners remain in Card, Accordion and DotMatrixLoader __tests__; temporary harness paths in logs are historical tool locations, not consumer requirements.

Full evidence: [layout-containers](evidence/layout-containers/README.md).
