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

## Current checkpoint

Owned behavior tests and typechecking pass. The owned normally installed tarball
passed all six Chrome framework/order cases (63,360 paired style snapshots),
matched loader RAF phases, Skeleton pulse phases and unmount checks. Worker 2's
committed source batch `2b7398668` is integrated as `86c83e6ea`; 17 combined
focused public tests and integrated types/build pass. Its interactive browser
validation remains pending. The browser window is released to Worker 2.
No integrated container checkpoint or overlay start is certified.
