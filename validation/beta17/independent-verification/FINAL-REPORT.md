# Independent #17 verification — completed, no new blocking finding

## Identity and evidence boundary

Formal producer evidence commit: **8b32d559888b5c59ff4814973253a93e94f0e77b**.
Benchmark committed archive SHA256: **fd0445769fe69b2a4cebef7eeb3f52b4e448b44afe415f622bb42c1203f98382**.
Soak committed archive SHA256: **c0ca2a9ba53c7f81af2110315ecb06c4e052fbac7ef92e3f9c01f52b0a6d01fc**.
V5 manifest:/private/tmp/beta17-consumer/handoff-v5.json
SHA256: **58f29005e395f360e521bc8f01992d5dc5ef2c8989861010b37802e5ebdda856**.
Product9ee0576133fbb1c444d03c169a81893ebf7631fd; fixture63b7342c9.
Pinned Chrome for Testing156.0.8078.47 mac-arm64, standard Playwright launches.

This is an independent read-only audit of the workers' complete formal evidence, plus an independently authored **bounded** reproduction. The verifier did not independently repeat the full80formal streams or two10minute soaks. No production/worker/friend/legacy/preview edits; all own code/results under /private/tmp/openui-beta17-independent-verification.

## Independent recomputation and provenance — PASS

- All80formal measured streams:4separate chat/dashboard × paced/stress cells,10unique alternating matched pairs/cell;8first-stream observations excluded. No pooling, missing or duplicate samples. Raw source hash/DOMcount/required rendered text/visible dashboard bar assertions all match contract. Active-stream input observations show changed value while activebefore/after1; no idle-only input sampling.
- Independently recomputed medians, nearest-rank p95 and inputp95 exactly equal committed summaries. Both timing metrics retained; DOM+twoRAF is diagnostic, not actual presentation timing or field INP.
- Both formal soaks:12warmupcycles, chat600295.784ms/483iterations, dashboard600232.315583ms/467iterations,20natural checkpoints each at30s targets, monotonic actual timestamps, all after target/before terminal. Cancellation cadence and each actual partial/abort/serverclose/timer record verified:48cancelcycles/arm chat,46/arm dashboard.
- Matched warm/terminal retained-heap GC phases confirmed from archived runner (doubleGC at endpoints, none in natural checkpoints). Every warm/natural/terminal style/rule count stable, zero active streams/timers; formal GC endpoint DOM/listeners match within each arm. Natural heap excursions are not treated as retained heap or leak proof.
- RSS independently recomputed from recorded owned-process sums; warm→terminal growth is negative in all4workload/arm rows, so agreed >100MiB investigation trigger not reached. This does not prove low absolute process memory or no possible long-run leak.
- Actual pre/post-independent-run file hashes match all10866frozen inputs (648168916bytes), including served assets, installed source inputs, lock/manifests, fixture and browserchain.3801module records match actual canonical paths/package owners/locked identities/content; candidate origins stay in installed core/kits, legacy origins isolated.
- Whole340regular-file browser bundle and5symlinks match manifest; symlinks remain inside bundle. Browser archive/executable hashes match recorded bytes. No browser updater/app configuration changed.
- Formal report/summary/manifest bytes audited before packaging match exact members of committed archives. Archived runnerfiles match the code read. Both archive bytes match Git blobs at the pinned commit; no uncommitted-only certification.

## Recomputed original timing results

| Cell | median change | p95 change | agreed boundary |
| --- | ---: | ---: | --- |
| chat paced |-0.337%|-0.456%|<=10%median,<=15%p95 |
| chat stress |+1.929%|+0.240%|same |
| dashboard paced |-0.062%|+0.253%|same |
| dashboard stress |+0.914%|+1.924%|same |

Paced input-command p95: chat baseline5.086ms/runtime4.835ms; dashboard baseline3.881ms/runtime3.409ms; each<=100ms. Ten samples' nearest-rank p95 is their maximum, so this is bounded local evidence, not broad statistical/production capacity certification.

Retainedheap warm→terminal: chat baseline+0.211MiB/runtime+0.367MiB; dashboard baseline+0.362MiB/runtime+0.491MiB; each<=5MiB. No forcedpressure/tab-close value substituted for these endpoints. Styles remain stable; baseline's external stylesheet is not counted as inlineCSS bytes, so inline byte counts must not be misread as total-CSS cost comparison.

## Independent bounded reproduction — PASS

Same frozen installed servedfixture at4197 and exact pinned browser; fresh independent session IDs, private result files. No builds/install/modification of frozen consumer or shared server. Both workloads and both loads;2alternating matched pairs/cell=16bounded measured streams,8excluded firststreams,4active partial cancellations and4successful postcancel retries. Complete output hashes, expected table/form/bar cardinalities, real visible chartbars, sourceidle, liveinputeffects, zero streams/timers and own pageerrors checked. Theme-hue changes/remount/unmount exercised. Short-run style/rule counts plateau and endpoint metrics recorded. No performance threshold acceptance inferred from n2/cell or short resource observations.

Bounded driver authored independently and did not call worker measureStream/cancelStream/summary helpers. Existing repository Playwright1.64.1 tooling loads outside the product consumer; product browser modules still come from frozen served graph. Browser CSP/host setup and payloads were not changed. No full unchanged matrix or formal soak rerun.

## Preserved short-run failure / corrections

1. Initial tool lookup assumed Playwright installed in product consumer; it is intentionally absent. Corrected to existing verification tooling, no dependency installation.
2. First bounded run added exact DOM-count equality after ONE first-stream warmup. The legacy baseline showed51→58nodes with listeners stable175, so that extra assertion stopped the run. Rawfailure remains in bounded-first-warmup-observation.json and bounded-reproduction-v2.log. Exact equality after one warmup was not an agreed acceptance criterion. The corrected bounded run records short DOM endpoints without interpreting them as retention acceptance; formal12cycle warmup/two10minute raw results were independently checked unchanged and have matching GC endpoints. No formal threshold/criterion was relaxed, no product repair and no historicalfailure reclassified green.

Final bounded run is bounded-reproduction-v3.log/results; exact inputs/current hashes in independent-evidence-sha256.json. Prior fixture versionsV1–V4 and interrupted formal attempts remain separate worker evidence; their partial runs are not counted toward V5.

## Limits and conclusion

No new blocking fixture/product/evidence finding established. The independently audited V5 formal results meet the agreed investigation thresholds for these frozen local workloads. This supports bounded #17 review, not automatic architecture/release approval or a universal performance/leak guarantee. Scope is ordinary HTTP response state with the real parser/Renderer and migrated installed UI; unported headless chat-shell behavior is not implied. Legacy stricttypes missingeve/client remains disclosed; browser functional/build evidence is separate. SSR stays deferred. Prior bundle/eagerCSS/font emission costs remain separately disclosed and are not erased by warm streaming timings.

## Reproduce/read

- `python3 audit.py` → raw-audit.json/log (independent calculations/current input/module/browser hash audit).
- `python3 bind-archives.py` → committed-archive-proof.json/log (Git-pinned archive linkage).
- `node bounded-reproduction.mjs` → bounded-results.json/log (requires root-approved browser window, frozen server4197 and recorded existing tool/browser paths).
- Key outputs: raw-audit.json, committed-archive-proof.json, bounded-results.json, bounded-summary.json, bounded-fixture-corrections.md.

**Browser explicitly RELEASED. All verifier-owned browsers/contexts closed. W1-owned server4197 deliberately remains live and unchanged.**
