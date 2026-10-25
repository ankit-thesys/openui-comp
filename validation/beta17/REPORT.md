# Beta validation draft — independent verification pending

The formal local V5 measurements passed the agreed investigation thresholds for
both deterministic workloads. The measured increase is small in these tests:
maximum completion median slowdown was 1.93%, and maximum completion p95
slowdown was 1.92%. This supports the scoped client-streaming approach; it does
not establish unconditional beta readiness or approval to migrate consumers.

The independent verifier currently owns the browser window. Its findings and
bounded reproduction must be incorporated before the final report or PR is
ready. Worker1 keeps the frozen fixture server unchanged and runs no browser,
build or heavy checks during that window.

## Measured comparison

| Workload/load | Completion median change | Completion p95 change |
| --- | ---: | ---: |
| Chat/paced | -0.34% | -0.46% |
| Chat/stress | +1.93% | +0.24% |
| Dashboard/paced | -0.06% | +0.25% |
| Dashboard/stress | +0.91% | +1.92% |

There are ten matched alternating pairs per cell, 80 measured streams after
eight excluded first streams. The gates were median <=10% and p95 <=15%
regression per cell. With ten observations per arm/cell, nearest-rank p95 is
the maximum observed sample. These are local point estimates rather than
production percentiles or confidence intervals.

Paced input-command p95 for runtime was 4.835ms in chat and 3.409ms in dashboard,
below the 100ms gate. This is a Playwright fill-command roundtrip during a live
stream, not field INP. Separate rendered-readiness diagnostics also passed;
DOM/bar geometry and two frames do not prove pixels were presented.

Both paced workloads completed ten-minute soaks after 12 warmup cycles. Chat
ran 483 measured cycles and dashboard 467. Runtime retained JavaScript heap grew
0.367MiB and 0.491MiB respectively, below 5MiB. Active streams and timers were
zero at every checkpoint. Runtime styles plateaued at one style tag, 217,642
inline CSS bytes and 1,428 rules; this is not removal of eager CSS. No endpoint
or natural aggregate RSS growth exceeded the 100MiB investigation level. RSS
sums process resident memory and can count shared pages more than once.

## Identity and evidence

- W1 immutable handoff commit: 63b7342c9; formal runner: 819385b55.
- W2 exact integrated evidence tree: 8b32d559888b5c59ff4814973253a93e94f0e77b.
- Manifest V5 SHA256: 58f29005e395f360e521bc8f01992d5dc5ef2c8989861010b37802e5ebdda856.
- Chrome for Testing156.0.8078.47, mac-arm64; Node22.22.2; Playwright1.59.1.
- All10,866 input hashes and independent2,765 installed file inventories matched
  before/after each formal run. Whole browser340files/5links were guarded.
- Benchmark archive SHA256: fd0445769fe69b2a4cebef7eeb3f52b4e448b44afe415f622bb42c1203f98382.
- Soak archive SHA256: c0ca2a9ba53c7f81af2110315ecb06c4e052fbac7ef92e3f9c01f52b0a6d01fc.

Exact raw reports, manifest/runner snapshots and original/reproduced summaries
are in performance/evidence/v5-benchmark.tgz and v5-soak.tgz. Detailed numerical
results and sampling semantics are in performance/evidence/V5-REPORT.md.
The performance directory is integrated byte-for-byte from W2's committed tree;
no raw evidence was reformatted. Prior incomplete attempts and lifecycle/static
prototype diagnostics remain separate and were not pooled into the formal run.

## Scope and remaining limitations

Formal measurements use plain CSS, host order before, actual installed public
Renderer/parser over real HTTP delivery and ordinary fixture React response
state. Chrome/plainCSS/Tailwindv3/v4 compatibility is separate48-case evidence;
it is not a claim that formal timing covered every CSS configuration. Soaks use
paced cells, not stress cells. The vertical BarChart configuration is stable;
this does not waive the inherited HorizontalBar string-height/legend-fit gap.

SSR/hydration/concurrent SSR, AgentInterface/OpenUIChat shell, headless chat-store
and AG-UI integration remain outside this result. Legacy strict types still
reference missing eve/client, and legacy build diagnostics remain disclosed.
Existing source was not patched to conceal those findings. Cold startup, total
bundle cost and unused emitted KaTeX fonts are not settled by warm timings.
The assembled library's approximately572KB gzipJS/218KB eager CSS totals remain
disclosed; JavaScript pruning and runtime styling are distinct mechanisms.

No claim of universal error-free behavior, all-chart parity or production-scale
latency follows. No merge, release, publication, deprecation or issue closure is
authorized by these results. Independent verification and root acceptance remain
pending before an appropriately bounded stacked draft can be finalized.
