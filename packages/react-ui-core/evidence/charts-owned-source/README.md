# Owned chart source checkpoint

Pie, Radial, Radar, Heatmap, Funnel, CalendarHeatmap and SegmentedBar (including
SingleStackedBar alias) preserve existing implementation and props. Only class
attachments and one-to-one stock-Goober styles change. No authoring converter is
shipped, and no custom runtime or dependency patch is introduced.

Each family began with a genuine public-root missing-export failure. The final
focused run passes 11/11: seven actual-Chrome behavior tests, two public support
tests, integrated Area empty behavior and strict public chart types. Producer
build, strict types and scoped semantic lint pass. Two independent review axes
have no remaining findings. Radar's original overflow selector failed its real
computed-style assertion (hidden vs visible); the supported terminal-:where
selector now passes. Original failed/partial attempts remain byte-for-byte.
The initial Pie callback assertion was corrected to existing value-descending
order; Radial/Funnel selectors were corrected to their unchanged DOM. A local
server sandbox failure is retained. These are test-harness corrections, not
legacy behavior changes.

Root integrated Worker2 Area batch5851f0624 as e99b52dc6. Its modify/delete
integration conflict affected only the Scatter helper test absent in our
ancestry; Worker2's committed version was retained. Area is now publicly
exported; full Scatter support/export integration awaits its family batch.
The test command explicitly discovers nested chart-family tests.

Normal-installed artifact, complete browser/framework/theme/state/resize/
print/export appearance parity, bundle pruning and final integrated slice
checks remain pending. Source behavior tests do not certify all19 entries,
SSR, parser streaming, performance, memory or universal accessibility.

## Installed comparison correction

The first frozen df52427f0 artifact comparison passed preceding family states,
then failed CalendarHeatmap/no-provider/pattern: copied inline foreground var
had depended on legacy global defaults. A normal CSS variable fallback to the
same existing foreground token fixes it; focused computed-fill red/green is
preserved. Both reviewers accepted the conventional fix. Their harness review
also required independent expected override/sentinel assertions and forwarding
Calendar className; these were added before the next artifact run. Initial
matrix is failed evidence, not acceptance. The first npm pack cache permission
failure and consequent install failure are retained; a temporary cache enabled
normal npm pack/install without global configuration changes.
