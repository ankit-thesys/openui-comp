# Real source correction: dark TextContentWrapper descendants

The first complete smoke recorded7Skeleton phase mismatches and1actual darkmath
mismatch (6px height). Preserve raw attempt02-smoke-differences, not relabelled.
Baseline CSSOM diagnostic confirms old Goober emits `.old:where(.dark).old p`
and `.old:where(.dark).old .katex`, duplicating the old class. In the new nested
namespace that duplicates a :root guard on a descendant and cannot match.

Use ordinary `&.openui-text-content-markdown-dark-mode p/h1..h6/.katex` authoring.
It has the same actual emitted baseline specificity:2classes+element forparagraphs,
3classes formath. Same targetapplicability and declarations. No Goober/parser/
cache/injector modification or consumer setup. Source inspection found this exact
conditional-where+descendant form only in this file amongconvertedcomponents.
Fresh emitted selector+theme/math checks must pass before accepting correction.

Skeletonphase is a separate assertion issue: PieChartSkeleton shape/legend dots
also run the unchanged infinite pulse. Compare geometry/cosmetics and native
animation descriptors, validate actual opacity ranges/progression separately;
do not disable/pause animations or claim singleframe phase equality. Only nodes
with their own actual infinite animation are omitted from phase-opacity equality.
