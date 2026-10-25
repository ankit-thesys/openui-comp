# Installed-package beta validation (#17)

Status: preparation, no performance or memory acceptance yet.

Compare the frozen installed kits/core artifacts in manifest.json with an
independently frozen legacy react-ui baseline. The older source-integration
prototype at a67bd0695 is comparison evidence, not a substitute for this test.
Preserve its inputs and measurements. Baseline packaging must happen from a
private copy; legacy source and existing previews remain read-only.

## Ownership and sequence

W1 owns fixtures/, functional/, shared manifest, integration and documentation.
W2 owns performance/. Independent verification writes only private temp evidence.
Each worker preserves the other's changes. W1 has the initial functional browser
window. W2 may prepare scripts but must not time or soak before explicit handoff.
No builds, profiling or competing browsers during formal timing and soaks.

1. Freeze baseline archive, both installed consumer locks, exact dependencies,
   browser/Node versions, served assets and build settings. Check compiled module
   origins against installed roots; reject workspace self-reference or two theme
   contexts. Hash archives and fixture inputs before execution.
2. Use deterministic chat and dashboard programs equally. Both arms must use the
   real HTTP transport, actual streaming parser and Renderer, matching themes,
   rows, series, chart animation settings and semantic output.
3. Prove partial output, final content, chart geometry, form/actions, active
   cancellation/retry, history/clear, unmount and zero live transport/timers.
   Verify plain CSS/Tailwind v3/v4 before benchmarking.
4. Freeze functional fixtures and hand W2 exact hashes, URLs and browser ownership.
   Preserve paced 40 ms/512-byte/size 2 and stress 0 ms/64-byte/size 6 workloads
   only after confirming actual payload size, UTF-8 chunking and output semantics.
5. Run matched randomized/interleaved baseline/candidate samples with warmup;
   retain raw samples, median/p95, sample counts and uncertainty. Separate cold
   observations, transport duration, parser/render work and frame opportunities.
6. Run each workload's 10-minute soak after warmup, with fixed cycle checkpoints,
   retained heap, stylesheet/rule counts and teardown transport counts. Record
   Chrome process RSS separately from JavaScript heap.
7. Independently review evidence and limitations before a bounded stacked draft.

## Accepted investigation thresholds

Chat and dashboard each: median slowdown <=10%, p95 slowdown <=15%; interaction
p95 <=100 ms. After warmup and each 10-minute soak: retained JS heap growth <=5
MiB, style/rule counts plateau, zero live streams after teardown. Chrome RSS
growth >100 MiB triggers investigation, not automatic failure. These thresholds
are investigation criteria, not permission to discard unfavorable samples.

Report bundle totals AND baseline deltas separately. Existing ~572 KB gzip JS,
218 KB generated CSS and unused emitted KaTeX fonts are absolute observations,
not comparative regression results. SSR remains deferred. Inherited HorizontalBar
string-height/legend-fit comparison remains unpassed; do not silently repair it
or infer unconditional beta readiness from this validation.
