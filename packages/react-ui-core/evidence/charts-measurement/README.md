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
controls/data/media suites do not. New immutable normal package and affected
owned framework/theme/geometry checks remain pending, followed by Worker2's
remaining Cartesian/Mini browser matrix. SSR/performance/memory remain deferred.
