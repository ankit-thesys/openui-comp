# Migration orchestration

Last updated: 2026-10-25 (Asia/Kolkata).

## Authorized work and constraints

Start slice #11 on top of #30. Complete containers/cards before overlays.
Stock Goober only; no dependency patches or new styling APIs. Legacy
`packages/react-ui` is read-only. Preserve existing props, appearance and
behavior; report inherited bugs separately. All remote writes target
`ankit-thesys/openui-comp`. No PR merges, releases or upstream writes.
SSR stays deferred; OptionCards waits for text/table/citation dependencies.

## Stack and evidence

| PR  | Branch                                | Reviewed head | State                                    |
| --- | ------------------------------------- | ------------- | ---------------------------------------- |
| #20 | codex/react-ui-core-first-slice-pr    | 48a877064     | Foundation; unmerged                     |
| #25 | codex/react-ui-core-form-controls     | f1e9b4f60     | Controls; CI green; unmerged             |
| #30 | codex/integrated-baseline-corrections | 433a0e31d     | Integrated baselines; CI green; unmerged |

#30 contains #21/#22, #26/#27, corrections #28/#29 and the later chart
deterministic-evidence change. Do not apply those changes twice. Friend branches
and original PRs remain intact. Combined verification: 175 chart tests, 275
controls tests, both baseline typechecks, full workspace build, and 40 chart
browser checks (five unsupported). Controls browser evidence retained from #29:
61 checks. #30 GitHub Build JS and changeset checks passed.

## Active workers

| Worker                 | Chat ID                              | Branch                         | Exclusive responsibility                                                                                                                                 |
| ---------------------- | ------------------------------------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenUI Kits (worker 1) | 01a16cae-f565-7dc2-adf5-343d199ae777 | codex/react-ui-core-layout     | Card/CardHeader, SectionBlock, Separator, Skeleton, DotMatrixLoader; package integration, root exports, dependency/lockfile changes, combined validation |
| OpenUI Kits (worker 2) | 01a16caf-561a-7fc2-af16-d21cd3c78422 | codex/core-layout-interactions | Accordion, Carousel, Steps, Tabs; owned tests and style parity; later Modal and TooltipWrapper after container checkpoint                                |

Worker 1 checkout: `/Users/ankitdas/.codex/worktrees/2d0f/openui`.
Worker 2 checkout: `/Users/ankitdas/.codex/worktrees/63b2/openui`.

Workers start from #30 plus this coordination record. Worker 2 sends required
exports/dependencies to Worker 1 rather than editing shared package metadata.
Each worker uses TDD through public consumer APIs, one bounded component batch
at a time. Use Chrome/plain CSS/Tailwind v3/v4, both style orders, real React
overrides, behavior/keyboard checks and theme isolation. No tests weakened for
green results. Worker 1 integrates committed Worker 2 batches; no uncommitted
cross-worktree copying. Stop affected work and report if custom patchwork seems
necessary. Leave other workers' edits and untracked `crates/` untouched.

## Stage gates

1. Migrate containers/cards and interactive layouts with public behavior tests.
2. Integrate and validate the container batch. Record commits/results here.
3. Only then start Modal/TooltipWrapper; test focus, dismissal, nested/portal
   themes and overrides. This phase is authorized, but depends on stage 2.
4. Final packed-package checks, old-style independence, unused JS/CSS checks,
   Chrome parity and independent review before declaring #11 ready.

Browser execution: Worker 1 has the first shared measurement window; Worker 2
does source/type/unit work until released. Avoid competing timed runs.

## Main-worktree preview

`/Users/ankitdas/thesys/openui` uses `codex/migration-preview` to show the combined
migration code. Local `main` remains unchanged. This is the migration stack only,
not unrelated branches. Preserve untracked `crates/` and
`docs/planning/friend-independent-tasks.md`. Advance the preview only with
committed integrated batches after checking status; never reset user edits.

## Resume checklist

Read this file, inspect both workers with compact thread snapshots, confirm
current branch heads and worktree status, then resume the active stage. Update
this record when ownership, commits, validation or blockers change. Do not infer
acceptance, merge permission or completion from an idle worker alone.

Current stage: stage 1 implementation in progress; no integrated container checkpoint yet.

Worker 1 has implemented Card/CardHeader, Separator, SectionBlock (FoldableSection
parts and SectionV2), Skeleton (including TableSkeleton/PieChartSkeleton), and
DotMatrixLoader on `codex/react-ui-core-layout`. Each family has a recorded
public-root failing test followed by a passing implementation test under
`/private/tmp/core-layout-evidence/`. Typechecking passed after the owned batch.
Normal installed-package Chrome validation is starting; these local behavior
checks do not certify the integrated slice. Browser window remains with Worker 1.
Worker 2 continues source/type/unit work only; overlays remain gated.

Shared dependency additions: existing-version ranges for Radix Accordion,
Separator and Tabs. Skeleton variants use separate modules to preserve root
import pruning. Component behavior is copied unchanged; generated Goober class
names attach existing one-to-one styles. No private Goober APIs or patches.

## Stage 1 handoff — 2026-10-25

Worker 1 source batch: `50c51fb40`. Worker 2 phase-one source batch
`2b7398668` is integrated as `86c83e6ea`; shared root exports and all three
Radix dependencies (Accordion, Separator, Tabs) are present on this branch.
Integrated source typecheck/build and 17 focused public behavior/pruning tests
passed. No source outside the new package was changed except dependency
importer records, changeset and this orchestration document.

Worker 1's normally installed owned-component tarball passed six Chrome cases:
plain CSS/Tailwind v3/v4, both stylesheet orders, five theme states, controlled
and uncontrolled foldable sections, keyboard/disabled/override/responsive/theme
checks and remount cleanup. 63,360 paired snapshots passed. Loading animations
also passed three matched RAF phases for each grid and Skeleton pulse phases
through standard Playwright clock/Web Animations APIs. These are owned-batch
results; they are not final combined certification.

**Browser window released to Worker 2 now.** Worker 1 will do source/type/packed
checks while Worker 2 validates Accordion/Carousel/Steps/Tabs, including its
reported possible inactive Tabs hover selector issue. Worker 2 must commit its
browser tests and any justified conventional fixes before integration. Worker 1
will then rerun the committed matrix on the final integrated tarball in its next
browser window. No competing browser runs.

Container checkpoint: **not yet passed**. Overlays remain gated. Neither worker
may infer overlay authorization from the owned/component-only results.
