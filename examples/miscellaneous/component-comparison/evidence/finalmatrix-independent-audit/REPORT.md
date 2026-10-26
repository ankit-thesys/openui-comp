# Independent integrated final-matrix audit

**Audit outcome: evidence integrity and complete execution verified; strict matrix verdict remains FAIL. No new deterministic component defect was demonstrated by the bounded checks. Seven new screenshot-only Review cells remain unresolved, and the HorizontalBar strict failures are preserved. This is not regression-free/all-parity acceptance.**

Evidence commit reviewed: `2d03fcf6b110c52d72fc75e2020b225c94346f9f` on PR41. Package candidate: `cf1a8a88123b9a577c9cb43ae69d857ea6242f11` (PR44). Historical baseline: `evidence/bench/final/reconciliation.json.gz`. New frozen evidence: `evidence/bench/templates-cf1/`. Lab source/evidence remained read-only; no product edits, pushes, merges, live AI/API requests, or full-matrix reruns.

## Provenance and count audit

Independently verified every one of **642 manifest files** against both recorded bytes/SHA-256 and its committed Git blob. Decompressed source-run archives equal the original local `run.json` bytes, and their hashes match the source-run identities. All four runs completed. Runtime bundle hashes, host styles, recorded runner files, package archives, case definitions and source selection were checked. The first read encountered Worker1 updating evidence from commit46c9f8ecd to2d03fcf6b; the final audit is pinned to the latter commit and has no hash mismatch.

The four runs are `2026-10-26-integrated-cf1-s1` through `s4`. They use the same artifact/browser/bundle/lock/host/registry identities. Source archives:

- `@openuidev/react-components`: SHA-256 `f62cf7f1d3bf9a6e3cfe57b6e2365ed821978d6d65cb080e0444bc907e94e46f`.
- `@openuidev/kits`: `543dad17a09b6914b25790afc103397f9f91c90b1687caa86a778934fac4bf32`.
- Legacy `@openuidev/react-ui`: unchanged `f38b45035706e9151a57d3328d2c23ec448483b73c5f0d5c64ba7420652b6fd9`.

Archived source-map contents independently match candidate Git source: **369 distinct react-components files and132 kits files, zero mismatches**. This binds the included implementation sources to the candidate; it is not a claim that every repository source file appears in a map. Exact hashes/files are in `candidate-source-bindings.json`. Chrome156.0.8078.47, binary hash `34fbfdb52aacee492bbada9972bf323eba663f8d8a069f86e2652e5158d6c580`, en-US/UTC/DPR1. Host CSS matches the previously frozen plain/Tailwind3.4.17/Tailwind4.1.18 inputs.

An independent Cartesian reconstruction from **218 exact unchanged case definitions** yields **12,450 unique expected cells**. All are present and executed exactly once across four shards; zero missing/duplicate/superseded cells, zero case-version changes, zero source-record mismatches, zero verdict-precedence errors. Recomputed counts:

| Status | Count |
| --- | ---: |
| Pass |9154|
| Fail |86|
| Review |30|
| Known issue |3180|
| Not covered |0|
| Not applicable |0|

Failure cases remain **Select open portal60**, **HorizontalBar string-height26**. Full audit: `integrity.json`. The new reconciliation SHA-256 is `3049f81c06afcebebf87e996fba47ecf0580a4b24e01222de3923188089768c8`.

## Delta audit: totals alone do not establish parity

There are **38 changed cell verdicts** and **62 changed layer statuses** against the baseline, not simply “same86 failures.” Seven old Pass cells became Review, and four old Review cells became Fail. Ten previously passing semantic layers became Fail, all within HorizontalBar; three previously failing HorizontalBar semantic layers passed. These are retained in `all-verdict-deltas.json` and `layer-status-deltas.json`.

Causal limitation: historical reconciliation combines runner1.0.0 (2550cells),1.0.1 (8730),1.0.6 (30),1.0.7 (1140); the new runs uniformly use1.0.8. Runner/probe/model hashes and the lockfile differ, while case definitions, browser, hosts and registry schemas match. Thus a verdict change cannot automatically be attributed to the template/rename artifact. Recorded normalization still disables CSS motion for deterministic matrix captures and compares zero-tolerance pixels; no new relaxed tolerance was introduced by this audit.

## Four newly failing HorizontalBar cells

All four previously Review/currently Fail cells were reproduced independently against the **actual frozen integrated runtime from shard2**, with the same public data/string-height/legend-fit props and the exact recorded environment/theme/width:

| Cell | Preserved strict finding |
| --- | --- |
| plain /768 /dark /instant | Plot heights78vs123px in saved sequential capture; layout/styles Fail |
| plain /1280 /dark /instant | Plot heights108vs138px plus gutter/axis width differences; layout/styles Fail |
| Tailwind4-before /1280 /light /instant | Saved layout/styles Fail; full literal differences preserved |
| Tailwind4-after /768 /light /instant | Plot heights153vs93px and724vs688px inner width; layout/styles Fail |

Full original layer details are in `four-new-fail-cells.json`, without normalization or verdict changes.

Bounded reproduction used **one pair per cell,240 synchronized frames each (960paired frames)**, ordinary production markup, no component CSS overrides, no motion-disabling stylesheet, no geometry freezing, and normal browser keyboard input. At all960 matching geometry/overflow states, control presence matched. Both arms cycle through heights0..273px with37 distinct observed heights. Widths alternate688/724px at768 and1200/1236px at1280, matching the inherited36px control gutter. Both have mounted controls in132/240frames and actual overflow without mounted controls in108/240frames. **16/16 Enter/Space checks** focus the normal labelled button, produce trusted click events and scroll movement. No page errors or invalid button names were observed.

Classification: **inherited unstable measurement/control availability with asynchronous snapshot-phase divergence is supported for these four recipes; no new deterministic template-specific geometry/control defect reproduced**. This does not erase the recorded layout/style/semantic failures, certify stable accessibility, or suppress any other HorizontalBar cell. The sampled overflow-without-controls remains a real shared usability defect. Other newly failing semantic cells were not individually rerun; their saved differences remain open. Prior native AX proof for the old artifact is kept separately and is not silently transferred to this new artifact.

Evidence: `horizontal-browser/analysis.json`, `horizontal-browser/browser-results.json`, per-cell raw240-frame/ResizeObserver/outerHTML/AX/keyboard data, and eight original iframe screenshots. The runtime is hash-verified in `horizontal-browser/runtime-provenance.json`.

## Seven new screenshot-only Review cells

Independently reran **pixel comparison on the saved PNGs**, not the matrix. Used threshold0 and includeAA=true, preserving exact differing pixels. Behavior, semantics, layout and computed styles passed in all seven; this does not make the pixel differences harmless.

| Cell | Independently confirmed difference |
| --- | --- |
| Bar /Tailwind3-after /768 /light /stream |29pixels at chunk3 and complete; x628,y466..494, a vertical strip in SVG path region |
| Bar /Tailwind4-after /768 /dark /stream |Same29pixel strip at chunk3 and complete |
| Tag /Tailwind4-before /768 /dark /stream |1pixel at complete:400,442 |
| Tag /Tailwind4-before /1280 /dark /stream |1pixel at complete:656,442 |
| ImageText /Tailwind4-before /390 /light /stream |2pixels at chunk11 near image region x34..36,y736..738; complete0 |
| ImageText /Tailwind4-after /390 /light /stream |Same2pixel image-region difference at chunk11; complete0 |
| ImageText /Tailwind4-after /768 /light /stream |2pixels at chunk6, x440,y125and239; later checkpoints0 |

**Disposition: unresolved raster-only Review, not proven new product defects and not proven harmless raster noise.** Two Bar strips persist to complete; Tag's pixel persists at complete; ImageText discrepancies occur during streaming checkpoints. Do not round, ignore antialias pixels, or infer cause solely from passing computed-style probes. A future bounded investigation can test repeatability/paint origin using these exact pixels. None was relabeled green or fixed in this audit.

Exact coordinates/RGBA values, smallest measured element regions and original image paths: `raster-audit.json`; source-run/layer records: `seven-new-review-cells.json`. This investigation used existing screenshots only; no extra browser cases for these families.

## Handoff and boundaries

The narrow source conversion review remains separate. Existing Input/Label customization findings, incomplete palette coverage and122/124 token coverage are not certified away by this matrix. Select paint failures stay strict Fail. SSR/hydration, full-shell acceptance and performance/soak work were not run or inferred.

**Browser explicitly released12:34:49.970UTC (18:04:49IST)**; temporary verifier server closed, lab4188 untouched. No further browser use or reruns after release. Another worker may proceed with the chat-only package. `horizontal-browser/browser-release.json` preserves release and completion metadata.

All findings, scripts, exact source/PNG provenance, raw bounded results and hashes are under `/private/tmp/openui-finalmatrix-independent-audit/`. Worker1 may retain these read-only artifacts in PR41; this verifier has not written the lab, production or GitHub.
