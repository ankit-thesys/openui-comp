# Beta validation — scoped results independently verified

The formal local V5 measurements passed the agreed investigation thresholds for
both deterministic workloads. The measured increase is small in these tests:
maximum completion median slowdown was 1.93%, and maximum completion p95
slowdown was 1.92%. This supports the scoped client-streaming approach; it does
not establish unconditional beta readiness or approval to migrate consumers.

Independent read-only verification found no new blocking issue. It recomputed
the complete formal summaries and audited both full soaks, then independently
reproduced both workloads/loads in a bounded16-stream run with live cancellation
and retry. It did not repeat the full80-stream benchmark or both ten-minute
soaks. Exact verifier artifacts and their original hashes are preserved under
[independent-verification](independent-verification/FINAL-REPORT.md).

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

Paced input-command p95 for runtime was 4.835 ms in chat and 3.409 ms in dashboard,
below the 100ms gate. This is a Playwright fill-command roundtrip during a live
stream, not field INP. Separate rendered-readiness diagnostics also passed;
DOM/bar geometry and two frames do not prove pixels were presented.

Both paced workloads completed ten-minute soaks after 12 warmup cycles. Chat
ran 483 measured cycles and dashboard 467. Runtime retained JavaScript heap grew
0.367 MiB and 0.491 MiB respectively, below 5MiB. Active streams and timers were
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
state. Chrome/plain CSS/Tailwind v3/v4 compatibility is separate48-case evidence;
it is not a claim that formal timing covered every CSS configuration. Soaks use
paced cells, not stress cells. The vertical BarChart configuration is stable;
this does not waive the inherited HorizontalBar string-height/legend-fit gap.

SSR/hydration/concurrent SSR, AgentInterface/OpenUIChat shell, headless chat-store
and AG-UI integration remain outside this result. Legacy strict types still
reference missing eve/client, and legacy build diagnostics remain disclosed.
Existing source was not patched to conceal those findings. Cold startup, total
bundle cost and unused emitted KaTeX fonts are not settled by warm timings.
The assembled library's approximately 572 KB gzip JS/218 KB eager CSS totals remain
disclosed; JavaScript pruning and runtime styling are distinct mechanisms.

No claim of universal error-free behavior, all-chart parity or production-scale
latency follows. No merge, release, publication, deprecation or issue closure is
authorized by these results. Independent verification supports this bounded evidence/report draft. Root
retains acceptance authority; merge and publication remain separate decisions.

## Independent audit and bounded reproduction

The verifier tied the archived raw report/summary/manifest bytes to exact Git
blobs at 8b32d5598 and independently recomputed all 80 formal samples, timings,
input observations, cancellation cadence,12-cycle warmup/two 600s endpoints,
20 natural checkpoints/workload, style plateau and RSS sums. All10,866 current
inputs,3,801 module records and full browser inventory matched. No uncommitted-
only certification or pooled prior partial samples were used.

Its independently authored driver used the same frozen served graph and pinned
browser with existing Playwright 1.64.1 verification tooling outside the product
consumer; formal tooling was 1.59.1. It executed16 bounded streams (two alternating
pairs/cell), eight excluded first streams, four active partial cancellations and
four successful retries. Rendered tables/forms/positive chart geometry, input,
themes/remount/unmount and zero terminal resources passed. These small extra
observations are correctness evidence, not another performance/soak verdict.

A preserved early bounded attempt added exact DOM equality after one warmup;
legacy nodes changed 51→58 with listeners stable 175. That assertion was not an
agreed acceptance criterion. The corrected bounded run records short DOM
endpoints without treating them as retained-memory acceptance. Full formal
12-cycle-warmup/ten-minute endpoints were audited unchanged and match. Original
failure, correction explanation and exact final driver/results remain preserved;
no product fix, formal threshold relaxation or historical failure relabeling.
