# Cartesian and mini chart validation result

Validation is complete for the supported scenarios across all11 assigned entries. **Default HorizontalBar string-height with a fitting legend remains baseline-confirmed unstable.** Its strict comparison is retained as a failure; there is no blanket parity-pass claim for that combination and no public prop is removed or declared unsupported. Chrome and local fixture servers are closed; browser released to Worker1.

## Measured package

Product revision1d31a4b63ee66f03c21688d96cee28bcad8380ac. Normal npm consumer /private/tmp/core-chart-tracking-consumer; tar /private/tmp/core-chart-tracking-artifact/openuidev-react-ui-core-0.0.0-beta.0.tgz,1062926bytes, SHA256638a8336a60800ae40fa4e46a7130ca41141393382652dd5cf9e73626a8de806. Every installed file matches the verified archive. Package/lock stayed unchanged, and all three completed groups have the same exact installed manifest and lock hash. Raw reports retain runner/fixture/bundle/host/baseline-CSS hashes and Chrome156.0.8078.47 version. Archived runner/fixture snapshots hash-match measured reports.

| Group           | Framework/order cases              | Supported paired observations | Result                                                         |
| --------------- | ---------------------------------- | ----------------------------- | -------------------------------------------------------------- |
| Line            | 6                                  | 11664                         | Pass                                                           |
| HorizontalBar   | 6                                  | 10728                         | Supported comparisons complete;6 inherited-instability records |
| Other9 entries  | 6                                  | 62730                         | Pass                                                           |
| Total11 entries | Same6 combinations across3 batches | 85122                         | Complete with inherited limitation                             |

Groups share the same immutable artifact. Each covers plain CSS/Tailwind3/Tailwind4, host before/after component CSS. Line was not repeated in the later groups. Other9: Area/AreaCondensed, LineCondensed, Bar/BarCondensed, Scatter, MiniArea/MiniBar/MiniLine. See results/browser/SUMMARY.json and corrected-line.json, horizontal-supported.json, corrected-nine.json. Historical horizontal report uses the field/status name unsupported; that is a diagnostic coverage label from that runner version, not a finding that the public height prop is unsupported. Current runner uses inheritedUnstableScenarios/completed-with-inherited-instability.

## Covered behavior

No-provider/default/custom light/dark themes, nested/independent scopes and palettes; actual container resize separately from numeric/string size props; empty/live-populated updates; grid/legend/stacked options; real pointer tooltips and callback argument checks; legend hide/restore with actual mark changes; explicit root utilities independently verified; active decorative entrance presence/timing plus settled geometry, reduced-motion gates; print media and the distinct React PrintContext export metadata; native Enter on overflow scroll controls; cleanup/remount and host sentinel isolation. Mini sizes80/160/100% are separate from full-chart sizing. Computed styles/SVG attributes/text/rects must match and stay unchanged for three consecutive samples after readiness; scroll must actually move and stabilize. No mocked observers, forced clicks, synthetic geometry or production patches.

## Preserved failures and inherited limitations

The original no-provider Line failure on7e425b5b7 is retained in BROWSER_FAILURE.md and raw attempts. Worker1 fixed the shared canvas tracking fallback conventionally; corrected Line6/11664 passes on1d31. Earlier bundle path mapping and the initial diagnostic font mistake remain documented, not product failures.

Corrected-remaining.json strictly fails HorizontalBar at height280px with fitting legend: root280px in both arms, but inner wrapper0px versus40px at the sampled phase. horizontal-height-diagnostic.json records120 actual animation-frame samples per arm. Both versions cycle through heights including0/2/40/78/116/154/192/258px; later sampling includes transient12/50px states. The copied orchestrator observes the inner body and repeatedly deducts legend height before assigning that body's height, eventually falling back at zero. This is inherited feedback, not stable geometry. A test assumption requiring identical observed state sets failed on a transient50px observation; horizontal-classified.json/log/runner preserves that failure too.

The diagnostic continuation records both cycling traces without certifying frame parity. It does not replace the original scenario with an alternate pass. Numeric-height checks remain strict; string height with legend=false AND fitLegendInHeight=false is a separately labelled scenario. Current default execution still strictly compares the original combination; CORE_CONTINUE_INHERITED_INSTABILITY=1 explicitly opts into recording it and continuing. Final PR acceptance must disclose the inherited default-fit limitation; any sizing redesign is a separate decision.

Other inherited findings verified: HorizontalBar's declared onClick is unwired; numeric width affects scales without setting its CSS box. Scatter emits no print-export metadata; its public domain helper clamps negative lower bounds. Legend rows have no authored native keyboard activation contract. These are preserved, not silently fixed.

## Checks and scope

All12 owned public-root tests pass together in source-stage validation and against the original normal full-chart artifact. Corrected-source installed native/strict/public-type/pruning and owned-family checks are Worker1 evidence, not repeated here. Strict updated fixture types and runner syntax pass. Both independent GPT6.1-Sol review axes accept source/tests, corrected Line provenance and the explicit inherited classification; final independent evidence reviews report no actionable findings. Reviewers were read-only and did not execute Chrome.

These results do not certify SSR/hydration, transport/parser streaming, performance/memory, frame-by-frame animation parity or migration-wide error freedom. Worker1 owns other chart families, final combined CI/metadata and draft PR handling. Root/friend/legacy/previews/crates ownership remains unchanged; reserved friend baseline paths were read-only. No product source was changed during this browser run.

Reproduction: use charts.browser.mjs with the exact CORE_* artifact/tool environment from BROWSER_PLAN.md. CORE_CHART_FAMILIES selects comma-separated entries; line and the other9 each ran strictly. Selecting horizontal without CORE_CONTINUE_INHERITED_INSTABILITY preserves strict comparison of the original default-fit string-height case. Set that flag to1 only for explicit diagnostic continuation; it records the inherited instability and continues other scenarios, without a pass claim for the original. Historical runner/fixture files are byte snapshots for provenance; execute the current runner from its original directory.
