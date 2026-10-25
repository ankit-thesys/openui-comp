# Slice #12 text leaves checkpoint

Depends on the source/citation foundation checkpoint. This batch owns Callout,
TextCallout, Tag, TagBlock and TextContent. All existing family exports and types must
be added at the root by Worker 1. No dependency additions are needed.

Pre-agreed seam: built public root consumer rendering. Each family's missing-export
red run preceded its implementation; raw red and green logs are in `results/`.
Five new consumer tests and all 65 component consumer tests pass. Configured source
strict typecheck, ESM/CJS declaration build, formatting and semantic lint pass using
the source-checkpoint scratch producer described in Sources/**tests**/README.md.
This is not final normal-installed or browser certification.

Styles use ordinary stock Goober tagged CSS/keyframes, retaining independent base,
variant and part selectors. Props, refs, existing class names, consumer styles and
content handling are unchanged. Callout's dismissal remains CSS-only; no JS timer.
Unused TextCallout icon selectors have no rendered elements and are not carried over.

Pending browser validation: all variants and tag sizes, truncation/wrapping,
Callout animation phases/end state, plain CSS/Tailwind 3/4 orders and explicit
consumer overrides, nested/custom/default themes and unused code/style checks.
No SSR or memory/performance claim is made here. Legacy source is unchanged.
