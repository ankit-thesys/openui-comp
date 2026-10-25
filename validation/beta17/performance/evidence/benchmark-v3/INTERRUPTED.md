# V3 attempt 1 — interrupted, not acceptance evidence

Frozen manifest SHA256:
`8d3f583e17dd4b5e12d24b5aacb7d5dabdd4dd7c09a1de8299a08195059e0b14`.
Runner source was `f2aad47ac`, archived verbatim under `runner/` at startup.

The formal command saved 2 excluded first streams and **20 of 80** measured
samples: the complete chat/paced cell. It then stopped making progress. A normal
operator process listing showed the owned Node runner alive at03:16 elapsed
with no automated Chrome process remaining. The saved position and source path
are consistent with stalled client/server cleanup after the first cell; this
is not proof of a Goober or product defect. Only that owned Node process65252
was terminated with SIGTERM (exit143). The W1 fixture server was not stopped.

`report.json` remains the exact last saved partial report. Its terminal samples
are idle with zero active streams/timers. `summary-incomplete.json` rejects the
incomplete matrix and absent terminal integrity checkpoints. Do not reuse these
20 samples as part of a later matrix or infer complete performance acceptance.

The conventional harness correction closes the connected Playwright browser
client before its owning server, still attempting both and aggregating errors.
Opening-failure cleanup uses the same function. A focused ordering test failed
before the fix and passed after it; all3 focused provenance/cleanup tests pass.
Independent Standards and Spec reviews found no actionable issue in the delta.
A separate nonmeasurement two-browser smoke passed: opened2, closed2, errors0
(`../cleanup-smoke-v3.json`). That smoke does not prove a full benchmark result.

`interrupted-postcheck.json` preserves independently recomputed maps after stop.
Installed core/kits files are unchanged. The only input differing from V3 is
Worker2's own `performance/browser.mjs`, deliberately edited **after** the runner
was stopped. Its reviewed cleanup change now hashes to
`331708aff3da94f867e2798cb87fb4a577ee14a815616a378cc2796debe242b7`.
V3's prior expected hash was
`0ba3d42ebdc398d81bc82aaa9cf4ed805d2443060b2bc6166865e8f537ae77da`.
No W1-owned manifest/fixture/server/client/payload/served/installed file changed.

Because V3 also freezes the harness file, **a new immutable handoff and explicit
release are required before a fresh80-sample attempt**. Do not edit V3 or bypass
the hash guard. All owned Chrome processes are closed; the quiet window/server
are explicitly released to W1. No soak ran and no performance verdict exists.
