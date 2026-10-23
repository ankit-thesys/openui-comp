# Owned component/runtime optimization measurements — prepared only

No measurements or candidate builds have run. Decision OPEN. See PROTOCOL.md for the pre-execution comparison, replicated short RSS diagnostic, final20-minute soak and remaining parser/guard limitations.

This scratch owns only harness code and eventual raw results. Components and chat integration are separate agent-owned siblings. Candidate builds wait for correctness freeze; all timing and load wait for parent exclusive GO. No old prototype, production source, cache or style manager is changed here.

Expected sequence after freeze: build own Renderer snapshot; freeze source/dependency/build/checker bytes; short labeled harness checks if needed; matched Renderer and real FullChat runs; Next pressure; three alternating-order fresh-Chrome RSS pairs; server and browser five-minute-per-arm phases. No unrelated CPU/browser work may overlap measured windows. Preserve all short/failed raw output before final phases and version any harness corrections.

Ports are provisionally4264(Renderer),4265(backend),4270(Next); occupied unknown ports must never be killed. Sibling roots/API are confirmed, while final correctness freeze is pending. Integration correctness uses4342/4343, outside these measurement ports. Executing scripts now is not authorized. Every measurement script requires PERF_EXCLUSIVE=1 and a frozen input manifest.

CSS byte fields use TextEncoder UTF8 bytes and separately retain DOM code-unit lengths. New fixtures require UTF8 document charset. SSR pressure records decoded document bytes and response content types; baseline linked CSS remains outside Node fetch, so document timings are not complete-page load comparisons. Actual readiness CSS/compile work is separate from streaming completion. Replicated RSS retains per-process inventory/type totals; gross summed resident memory may count shared pages repeatedly and cannot isolate CSS native allocations.
