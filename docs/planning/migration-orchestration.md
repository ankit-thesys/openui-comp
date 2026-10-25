# Current slice12 checkpoint — 2026-10-25

Worker2 fixed media retest PASSED: 6 cases / 8,292 snapshots on the frozen normal npm artifact at production96221894a, SHA256 cb6306b9646be0dad2654542156e5e11623600bfe321abe2a9d5496cf21f8b45. Evidence4a82625a6 integrated ase1c2f55c7. Source/presentation12 cases /22,056 snapshots remain tied to the earlier680118396 artifact. Worker1 now retains the browser window for math validation; older handoffs below are historical.

Worker2 composers412b24dc8 and review2a162b17b integrated as415471d00 and1ba667281. IconTag/IconText/ImageText/ImageTextLarge public exports added locally; final integrated artifact and composer browser validation remain pending. Worker2 reported85/85 scratch tests, native imports, three strict consumer modes and two clean reviews; these are not a substitute for the final integrated installed artifact.

Worker1 TextBlockView9d72fb860 is committed. TextContentWrapper implementation is locally focused-test/type/build green, with source review pending. Automatic KaTeX CSS/font delivery is an unaccepted third-party static CSS exception prototype. No custom injector or runtime patch is implemented; do not claim automatic math styling or whole-slice acceptance. The isolated Vite asset probe built successfully, but unused bundle pruning and browser asset delivery still require measurement and architecture review.

# Updated browser handoff — fixed media artifact,2026-10-25

Worker2's prior browser window is complete/released; Worker1 releases the next window back to Worker2 for media retesting now. Old source/presentation12 cases/22,056 snapshots passed on production680118396; media failed and has a reviewed canonical grid-row whitespace correction, now integrated as2de26659c+1f876a4a3 (both9bb31d238/9214cc528). Evidence b536b6a29 integrated as96221894a. No parser/runtime patch or legacy source change.

New immutable normal npm consumer: `/private/tmp/core-source-media-fixed-consumer`.
New tarball: `/private/tmp/core-source-media-fixed-artifact/openuidev-react-ui-core-0.0.0-beta.0.tgz`, 375293 bytes, SHA256 `cb6306b9646be0dad2654542156e5e11623600bfe321abe2a9d5496cf21f8b45`.
CORE_ARTIFACT_REVISION=`96221894aa2273dc85059fe94efa155ef1f1210a`. Same browser/Sass/host tools as prior handoff. Normally installed media tests3/3 passed. Old consumers/artifacts remain untouched; do not overwrite running cases. Worker2 should retest affected media cases and explicitly record old-source/presentation evidence scope; final combined retest decisions depend on actual source changes.

Worker1 owns InlineHeader, TextBlockView and TextContentWrapper plus shared exports/deps/integration. Worker2 owns IconTag/IconText/ImageText/ImageTextLarge after matrix/fixes, requiring committed TextBlockView. Worker1 is doing source-only composer and package checks; no Chrome until Worker2 returns the window. Math/style automatic delivery remains an unaccepted validation risk. Native/strict/pruning prerequisites are now normally installed-green (11 tests,3 strict modes); archive under evidence/text-media-prerequisites, not whole-slice acceptance.

# Browser handoff — Worker2 window released, 2026-10-25

Worker1 has finished its measured ScrollableTable probe and is doing source-only markdown work. **Worker2 may run the prepared foundation/media matrix now** against this frozen normal npm consumer. Do not point it at Worker1's changing dist or repack its artifact.

- Consumer: `/private/tmp/core-source-media-npm-consumer` (actual npm-installed directory, package-lock.json present).
- Exact tarball: `/private/tmp/core-source-media-artifact/openuidev-react-ui-core-0.0.0-beta.0.tgz`,353244 bytes, SHA256 `eefb647a4128f0b8754cb906fbccd6d0aecb41ab526d61494d32929412d95f3f`.
- CORE_ARTIFACT_REVISION: `680118396504e39cff1534c9de191aac38832f02` (Table/source/media/CodeBlock production; Markdown not included).
- Normal npm focused consumer tests:17/17 passed; frozen install/logs in `/private/tmp/core-source-media-artifact`.
- CORE_BROWSER_TOOLS: `/Users/ankitdas/.codex/worktrees/2d0f/openui/packages/react-ui-core`.
- CORE_SASS_TOOLS: `/private/tmp/openui-controls2-tools`; CORE_HOST_STYLES: `/private/tmp/core-forms-host`.
- CORE_PLAYWRIGHT: `/private/tmp/claude-501/-Users-ankitdas-thesys-composition/f7cd0fa2-b747-4784-9f8b-62c79464ba26/scratchpad/pr1744/node_modules/playwright/index.mjs`.

Browser harness commits5ff35640a/8a9e4d3fa/06bc3f11a integrated as532753c85/3cb260662/ef0d48b9f. No matrix pass is claimed yet. Worker1 will not run Chrome until Worker2 releases the window back. Worker2 must preserve first failures and report any product mismatch without silent baseline repairs or runtime patches.

# Active slice #12 — 2026-10-25

Parent draft PR #33 is GREEN at217a662d4: build/package CI passed (run40142522614), changeset passed (run40142522609). The correction from21819f19d is diagnostic formatting/evidence only; no product behavior or measured browser assertions changed. Slice12 branch `codex/react-ui-core-text-media` starts from corrected head217a662d4, keeping slice12 off PR33.

Worker1 owns Table and all public parts, CodeBlock, MarkDownRenderer, InlineMarkdownRenderer, shared root exports/dependencies/lockfile and final integration. Worker2 owns shared icons, source context/schema/safeURL, favicon/citations/Sources first, then assigned leaf text/media. Table and InlineMarkdownRenderer stay in this slice. Do not duplicate Table or edit another worker's files. Source/citation foundation must be committed before markdown integration; no importing legacy implementation into the new package. Remaining leaf ownership will be assigned explicitly. OptionCards remains deferred. Worker1 gets the first browser window once source batches are ready.

Agreed TDD seam: built and normal packed package root, public React DOM behavior and real Chrome; strict types/native ESM/CJS/pruning accompany it. First staged Table test fails because the root export is missing, before implementation. Scroll behavior uses actual browser ResizeObserver/geometry, no mocks. CodeBlock clipboard uses real browser APIs. Preserve source security/rendering defaults and options; report inherited bugs separately.

Compatibility probe: Node rejects the legacy syntax-theme directory import; explicit `react-syntax-highlighter/dist/cjs/styles/prism/index.js` works through the same public themes. Use only necessary supported entry changes. Math source has dynamic rehype-katex but no KaTeX CSS import found; this is a validation risk, not a proven blocker. Verify actual automatic CSS/font delivery before accepting that component. Stop affected requirements if supported tooling cannot meet the contract without patchwork.

No custom runtime patches, stock Goober only, legacy read-only, neither preview modified, no merges/releases/upstream writes. Continuous authorization and root heartbeat from prior handoff remain in force; unresolved product/contract decisions go to user review. Optional friend tickets31/32 remain unassigned.

## Markdown prerequisite update

MarkDownRenderer committed16f89371d; InlineMarkdownRenderer is now source-green through public GFM tables/citations, flattening, empty/default/theme updates, configured strict types and native ESM/CJS. The copied legacy remarkCitations helper is unchanged. A test's alignment-class assumption was corrected only after independent legacy/candidate rendering proved matching inline textAlign output; raw failed/comparison logs are preserved. Final visual/framework acceptance remains pending. No baseline adapter bug was silently repaired.

Remaining leaf composers (InlineHeader, TextBlockView, TextContentWrapper, IconTag, IconText, ImageText, ImageTextLarge) still await explicit root ownership. Math CSS/font automatic delivery remains a risk to validate. Worker2 has the released browser window; Worker1 continues source-only checks.

## Current slice12 source checkpoint

Table primitives committed443595a3f; ScrollableTable committedd35642508. Public React test and actual Chrome scrolling/resize/children checks pass, producer build/types pass, both review axes have zero actionable findings. Final installed/framework parity remains pending.

Worker2 source batches integrated: 5e8d8c78c→458cf6aa4, bdf10d239→6e167c166, da6bb9656→03324527f; handoff305099ceb→db23ab68a. Parent correction copies were not reapplied. Public exports/dependencies are integrated locally; foundation/Table focused16 tests pass. Zod preserves legacy peer classification; aspect-ratio uses legacy runtime range. No final source/media browser acceptance yet.

CodeBlock vertical is green through public behavior/default+custom themes, native root ESM/CJS and producer strict types. Supported tsdown theme-data bundling resolves the legacy extensionless entry/DefinitelyTyped mismatch without shims or patches; React/Goober remain external. Markdown and InlineMarkdownRenderer are next, and remaining leaf ownership is still explicit/orchestrator-controlled. Worker1 retains the browser window; Worker2 prepares harnesses only.

## Prior slice #11 record

# Current migration handoff — 2026-10-25

## Slice #11 ready for review — PR #33 CI correction

Draft PR #33 on the fork targets codex/integrated-baseline-corrections. Remote build succeeded at21819f19d, but package CI stopped on browser-diagnostic formatting. A whitespace-only formatter correction is being submitted; full local core format:check passes. Wait for corrected remote CI before creating the separate codex/react-ui-core-text-media branch. Do not add slice12 to PR33.

Final production integration `66547405c`; test-only dependency alignment `135da0d8f`. Worker2 overlay commits fb46c2103/1234eb902 integrated as d0bccb9b9/d179585bf. Full combined CI **64/64**, normal installed public tests **53/53**, strict types in three module modes passed. Final overlay Chrome matrix **12 cases /4,674 snapshots** passed; earlier container checkpoint **30 cases /132,051 snapshots** plus loading animations remains archived without an unnecessary rerun. Independent Standards and Spec reviews: zero actionable extraction findings.

Final exact tarball SHA256 `784a951ebf8cf974b6a275b72a7c58fa8ed8abc0c400266efc8808a4fa9f09ea`, 246,462 bytes. Artifact, raw logs, failed-run diagnosis, reviews and limitations: `packages/react-ui-core/evidence/layout-overlays/README.md`. The first integrated browser mismatch was different Radix accessibility subtrees from unmatched dependencies; a reviewed test-only alias aligns both arms to candidate Tooltip1.4.1. Assertions and product code are unchanged. Full corrected matrix passed.

No extraction-only blocker remains in scoped checks. **Inherited limitations require review:** Modal has no focus trap/return, nested title IDs collide, Tooltip truncation replaces the child ref, and composed pointer dismissal has a preserved baseline observation. Do not claim accessible-modal certification, complete ref preservation, SSR or performance/soak acceptance. No whole migration completion or issue closure is implied. Root orchestrator arranges stacked draft and next-ticket ownership.

Worker1 browser window is released/available. Worker2 is idle after a read-only slice12 plan; no slice12 production work is dispatched here. Proposed prerequisite order: Worker2 source context/schema/safe URLs/icons/favicon/citations/Sources; Worker1 Table/CodeBlock/markdown renderers; leaf media/text batches afterward. Table has one owner; OptionCards remains deferred until prerequisites pass. Next ownership comes from orchestrator.

## Durable authorization and boundaries

User explicitly authorized continuous migration-ticket work on2026-10-25. Root heartbeat `finish-openui-migration-tickets` is active every five minutes, coordinating existing workers and stacked review-only PRs. No merges, publication or upstream writes. Optional friend tickets31/32 remain unassigned. Unresolved product/contract decisions require user review.

Main preview is `/Users/ankitdas/thesys/openui-comp` (preview at433a). `/Users/ankitdas/thesys/openui` is off limits for modifications. Workers must touch neither preview and must work only their own isolated checkouts. Legacy source stays read-only; stock Goober only; preserve unrelated untracked crates. No custom runtime patches. SSR remains deferred.

## Historical handoff records

The following records describe earlier checkpoints and are superseded by the current status above.

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

### Integrated non-browser update

At `9f7cac621`, the combined container source passes complete scoped CI: 49
tests, formatting/lint/types, isolated old-source-free build, packed consumer,
publint and attw. A separate normal installed consumer passes 17 focused
layout/pruning tests and strict Bundler/NodeNext ESM/NodeNext CJS declarations
with skipLibCheck false. The shared JSDOM helper exposes its actual
MutationObserver because newer compatible Radix uses it; no production shim.

Worker 2 retains the browser window. Its targeted Chrome checks found and
conventionally corrected inactive Tabs hover selector ordering, and corrected
the Carousel measurement to sample settled scrolling. Those source/test changes
are not integrated until committed. Its full matrix and final combined tarball
checks remain pending. The container gate is still closed; no overlay work yet.
