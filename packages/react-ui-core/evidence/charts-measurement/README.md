# Shared chart tracking correction

Worker2 diagnostic36a2a4fd4 is integrated as adbb356fc. Its original frozen7e
artifact, failed Cartesian comparison and actual canvas/tick measurements remain
under Charts/BarChart/**tests**/results/browser/. No old artifact is overwritten.

The shared canvas hook read tracking only from a CSS variable previously supplied
by legacy global SCSS. Core tick styles already fall back to -0.01em. The
conventional correction keeps CSS precedence, then uses the existing theme token
and matching default, and adds that token to memo dependencies. Explicit string
zero remains supported. No new measurement engine, injector or patch is added.

Public real-Chrome Line test: genuine default28-vs27red then green; explicit CSS
zero28, theme zero28, and CSS1px over theme zero31 are asserted. Producer build,
strict types and scoped lint pass. Both independent review axes have no findings.

Affected shared consumers include Cartesian axes and legends, Scatter budgets,
Radar labels, Heatmap axes/cell labels, Funnel labels and Calendar labels. The
DefaultLegend means Pie/Radial/SegmentedBar can also be affected in their compact
legend configurations. Only chart-related checks need repeating; unrelated
controls/data/media suites do not. The corrected artifact below passes affected owned framework/theme/geometry
checks. Worker2's remaining Cartesian/Mini browser matrix is still pending.
SSR/performance/memory remain deferred.

## Corrected immutable package and handoff

Production source:1d31a4b63ee66f03c21688d96cee28bcad8380ac.
Consumer:/private/tmp/core-chart-tracking-consumer.
Tar:/private/tmp/core-chart-tracking-artifact/openuidev-react-ui-core-0.0.0-beta.0.tgz.
Bytes:1,062,926. SHA256:
`638a8336a60800ae40fa4e46a7130ca41141393382652dd5cf9e73626a8de806`.

Normally installed public Line regression passes. All19 native ESM/CJS entries,
strict TS5.9.3 skipLibCheckfalse Bundler/NodeNext ESM/CJS contracts, selected
Button/chart pruning and formatting pass. Actual Chrome affected-owned matrix
passes6cases/46,440paired observations: plain/TW3/TW4, both initial stylesheet
orders, five themes, existing compact Pie/Radial legends, other owned chart
measurement/geometry, real hover/tooltips, responsive widths, actual overrides,
print/export endpoints, empty recovery and remount. Every installedfile matches
the tar archive; package/lock hashes stay unchanged. Exact executed harness,
fixture, report and consumer manifests are preserved separately from7e evidence.

Both independent source and affected-harness review axes have no findings.
No production source changed after1d. Existing animation-keyframe evidence stays
tied to7e; measurement mode does not repeat unchanged metadata checks or certify
phase-matched motion. Full integrated package CI waits until Worker2's remaining
matrix and explicit browser release. W1 Chrome/server are closed; browser is
explicitly released to Worker2 on this exact corrected artifact.

## Reviewed draft and remote checks

Draft37:https://github.com/ankit-thesys/openui-comp/pull/37, stacked on PR36.
Reviewed pushed source:ddd9f9a5e13a61a865cee76212b13a6230fc67d3.
Remote BuildJS40195759345 PASS8m16s; changeset40195759293 PASS13s.
Remote core136/136 plus package checks pass, matching local136/136. Two existing
ThemeProvider lint warnings remain; no lint errors. Post-CI all2,198 producer
dist files match the corrected frozen artifact byte-for-byte; proof is archived.

The inherited HorizontalBar default string-height/fitting-legend strict comparison
remains UNPASSED with baseline-confirmed feedback. Raw failed comparisons and
classified traces remain in Worker2's committed packet. Passing CI does not
convert that gap into a pass or authorize merge, release, deprecation or issue
closure. Final PR body discloses it. Post-CI docs/evidence are local-only to avoid
restarting green CI on unchanged product; root may carry them forward.
