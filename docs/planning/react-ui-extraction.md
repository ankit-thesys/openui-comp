# React UI extraction planning

Status: interview in progress. This is a record of scope and open decisions, not an implementation-ready spec.

## Confirmed scope

- Develop in `ankit-thesys/openui-comp`. All current GitHub writes remain restricted to this fork.
- Prepare `react-ui-core` (including all charts) and the initial chat kit alongside the existing `react-ui`; retain the existing package during beta evaluation and gradual migration.
- Copy the full existing chart set, including its supporting chart implementation, into `react-ui-core`. A separate react-visualization package is not in scope. A small chart demonstration is not sufficient.
- Extract the complete reusable core component set into `react-ui-core`. AgentInterface and OpenUIChat are explicitly excluded; core is not the owner of chat-specific UI. The full 65-family inventory is approved. FollowUpBlock, FollowUpItem, and ModelSwitcher are assigned to kits/chat for Monday. Do not port AgentInterface for now; its extraction and future placement are outside Monday scope. OpenUIChat, tool components, and chat helpers require boundary decisions where needed by that work.
- Make react-ui-core publish-ready using the same conventions as `react-ui`. Its eventual home and release destination is the upstream OpenUI project, alongside `react-ui`; this does not authorize upstream writes or publication now.
- Defer registry and source-distribution design. Earlier source-copy decisions remain future direction, not a prerequisite for this extraction milestone.
- The initial chat kit and `openuiChatLibrary` with its required definitions/support in `kits/chat/libs/` are in Monday scope. Do not bring over the assembled `openuiLibrary`; its future ownership and treatment require a team decision. Preserve its existing implementation. Dashboard and additional kits follow. Chat-kit packaging remains open.

## Extraction compatibility decision

Preserve existing props as much as possible, with no intended behavior or appearance changes. Make only changes absolutely necessary to separate the packages. Any proposed redesign or observable deviation requires a separate explicit decision; do not silently include it in extraction.

## Parallel validation and replacement

The existing react-ui is the reference baseline while the extracted core package (including charts) and chat kit are developed and tested alongside it. The user's side-by-side requirement is comparative validation on the way to replacement; it does not establish a promise that old and new components or providers are interchangeable within one component tree.

At the eventual cutover, react-ui-core takes over reusable components and charts. Chat interfaces and kit libraries are outside core, so their migration path must also be accounted for before retiring the full old package. Deprecation does not itself mean deleting the old package or its published versions. The submission deadline is Monday, October 26, 2026, with testing completed before submission. This is not an agreed deprecation date; the calendar cutoff and detailed support policy remain open.

## Open decisions

1. What are the exact public exports and ownership of supporting providers, utilities, and contexts for the approved core inventory?
2. How should OpenUIChat and tool/chat helpers needed by the chat kit be handled without porting AgentInterface? AgentInterface placement is a later decision, outside Monday scope.
3. What workspace/package/export shape will kits/chat use? Its library is confirmed as openuiChatLibrary. What does the team want to do with the separate openuiLibrary in the future? That decision is pending and does not authorize its relocation now.
4. How should shared fixes be applied to the old implementation and new copies during beta?
5. How will the agreed props, behavior, and appearance preservation be verified, and which import paths and provider boundaries must the new packages expose?
6. What test setup will compare old and new implementations without provider or global-style cross-contamination? Sustained mixed-component interoperability is not an agreed requirement.
7. What package names, release versions, and beta publication process should be configured?
8. What validation and migration evidence permits eventual deprecation?

## Code audit observations

- `react-ui` exports more than shared UI: charts, chat UI, theme, genui libraries, and runtime re-exports are part of its current public surface.
- Charts depend on shared controls, theming, style utilities, and print context outside their subtree.
- Existing theme providers use module-local React context and default to body-scoped CSS variables. A copied implementation can create separate contexts while still sharing global CSS names.
- The existing CLI provides scaffolding helpers; a component registry and conflict-aware source updater would add scope.

Sources: `packages/react-ui/src/index.ts`, `packages/react-ui/package.json`, `packages/react-ui/src/components/Charts/`, `packages/react-ui/src/components/ThemeProvider/`, and `packages/openui-cli/src/`.

## Component inventory

See [the approved core component inventory](react-ui-core-component-inventory.md) for all 65 approved families, chat-kit ownership, deferred items, and supporting code requirements.

## Submission deadline and proposed timebox

The user has three days before Monday, October 26, 2026, to finish and submit the work, including validation. The submission time of day remains unspecified; the scope now includes react-ui-core including all charts, the initial chat kit, and openuiChatLibrary. AgentInterface will not be ported in this milestone. This deadline is confirmed; feasibility of the full extraction is not yet established.

Approved Monday deliverable: react-ui-core containing the complete approved reusable UI inventory and full chart set; the initial kits/chat with openuiChatLibrary and its required definitions/support, ModelSwitcher, FollowUpBlock, and FollowUpItem. AgentInterface stays in react-ui and will not be ported. Include publish-ready configuration for core, kit integration, validation evidence, and explicit gaps. Existing react-ui stays available. AgentInterface extraction, a separate visualization package, dashboard/additional kits, registry/CLI work, actual publication, and deprecation are outside this submission.

Proposed sequence:

- Friday: finalize core/chart/support and chat-library boundaries and acceptance criteria; establish build and test baselines.
- Saturday: extract core including charts and the initial chat kit/library; configure package boundaries while leaving AgentInterface in the old package, checking each part as it is assembled.
- Sunday: verify behavior and visual parity, types, package artifacts, integration, and regressions; fix failures.
- Monday: submit the reviewable work with validation results and explicit limitations.

This is a planning timebox, not a guarantee. Theme/context coupling, CSS distribution, the full chart surface, and the chat-library work are the main observed risks. The larger scope increases schedule risk; feasibility has not been established. Do not hide failing checks or reduce the agreed component/chart inventory to meet the deadline; surface any scope/date trade-off explicitly.

## Draft specification

The [draft spec](../specs/react-ui-extraction.md) contains the approved scope and complete inventory, plus the pending Monday decision checklist. Remaining implementation decisions are explicitly marked open.
