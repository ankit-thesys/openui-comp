# Expanded runtime integration: prototype protocol

Decision remains OPEN. User requested broader components, full chat, disabled-cursor consistency and fresh performance/memory measurements. This round does not accept runtime/static, migrate production, change ownership or authorize implementation tickets. Preserve prior experiments.

## Candidate and correctness gate

Use actual reusable component implementations and the existing full AgentInterface/ChatProvider/store/parser as test subjects. Reusing AgentInterface is not a decision to port it. Runtime Goober must execute component/shell object definitions with automatic React 19 resource delivery and scoped inline themes. No legacy component CSS may silently supply the runtime arm. Inventory exercised components, styles and untested states explicitly. If shell styles are aggregated, report that delivery/payload limitation independently from per-component styling.

Test plain CSS, full Tailwind v3/v4 Preflight and intended utility overrides, actual effective stylesheet order, props/default appearance, interactions, SSR/hydration and delayed reveal. Disabled cursor contract: ordinary cursor utilities retain not-allowed on disabled controls; an explicit disabled:cursor utility can customize it. Record any contract exception rather than weakening an assertion to pass.

Full chat covers actual composer, pending/partial/final parser output, table/chart output, history restore, cancel/resubmit, theme updates, unmount/remount and stream cleanup. Runtime shell and response styles must be included. Host style/scoping, portals and dynamic states need direct observations; mere presence in a bundle is not coverage.

## Fresh measurements

Freeze candidate sources, generated descriptors, dependency versions, assets, built outputs and executed checker hashes before timing. Builds and unrelated browser tests must not overlap measured windows. Correctness failures are investigated before performance interpretation; failed candidate runs remain evidence.

Browser: equal chat/dashboard weighting, normal and pressure loads, matched alternating original/runtime pairs, one excluded warmup and ten measured pairs per cell. Report native-speed/saturated work separately from paced replay. Check final content and style parity; record adapter/Goober time, input and frame proxies, long tasks, total time. Pacing can hide CPU cost. Full chat end-to-end cases use the real store; distinguish them from Renderer replay.

Memory: twenty measured minutes total, excluding setup/warmup. Fresh server processes: five minutes original and five minutes runtime. Fresh browser processes: five minutes original and five minutes runtime. Each phase alternates chat/dashboard; include changing themes and cancellation. Natural heap/RSS/resource samples every thirty seconds. Forced GC only at comparable warmed pre-load and terminal idle/teardown checkpoints, never during timed load. Report retained JS heap separately from RSS and resource counts. Prior results do not certify this build.

Provisional investigation budgets: retained heap growth exceeding max(10% of warm heap, 5 MiB), retained DOM growth >100, listeners >20, any continuing stylesheet/rule growth at equivalent lifecycle checkpoints, missing content/errors/live streams after teardown. These are diagnostic thresholds, not production guarantees. Distinguish first-use resource caching that plateaus from continued growth.

SSR pressure uses bounded concurrent requests with themes, content/style checks, cancellation and server health. Prefer real Next; label standalone SSR clearly if used. Closed-loop laptop throughput is not production capacity. Never sum overlapping gate counts into coverage claims.

## Evidence and review

Publish new prototype files only to the existing fork prototype branch, with protocol, sources, raw successes/failures, summary and reproduction. Keep the Wayfinder prototype open for human review. Record remaining public customization, full-library coverage, portals, strict CSP, package installation and payload questions without treating untested requirements as passed.
