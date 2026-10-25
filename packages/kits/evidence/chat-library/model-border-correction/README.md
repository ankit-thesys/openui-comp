# Model-only border correction — artifact ready, browser pending

Integrated W2 source1a41c2c33 as9ee057613: one ordinary borderColor:currentColor
inside the existing hover/open rule. This restores the legacy equal-specificity
reset that previously won because Select SCSS appeared first. No sharedSelect,
legacy, public API, theme token, runtime patch or consumer setup was changed.

Preserve old failed8405 evidence: 42/330 style-state comparisons differed in
four border colors each; all36 semantic cases completed. Source review alone
is not a correction pass. W2's committed enhanced regression is integrated as
aae711ad3; KIT_BORDER_ONLY=1 labels the focused model-border scope and retains
strict comparison while adding open trigger, exposed width/style border and
winning consumer color checks. Verifier currently owns Chrome; no rerun yet.

New archive237948bytes / SHA9fc227a88cbf6d949247aee90e729efa58d669ba738674880396903db98785bb.
Compared with the metadata-corrected7ad archive, only modelSwitcher.styles ESM,
CJS and their source maps differ (four files); all other562 files byte-identical.
Installed566kits+2202corefiles match archives; exact paths, source40-character
commit, consumer manifest/lock and hashes are retained in artifact-proof.json.
The core archive remains a5d002d20a6fbed1cdb61cddc255f1619dc945d08cf9406eb3ce94e135988fe2.

Build/types and complete combined package CI pass: 7/7 tests, formatting,
semantic lint, build, Publint and ATTW. Six inherited hook warnings, zero errors.
Both independent correction source/harness reviews have zero actionable findings.
Affected Chrome verification must follow verifier's explicit release.
No whole-core/library matrix repeats solely because a model style changed.
No final visual parity, #17 performance/memory or SSR claim.
