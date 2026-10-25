# Deferred OptionCards source handoff

Base green PR35 `838d78ec23f3c4e31c84873b9926d518cd5c2776`. Worker2 owns only this family; Worker1 owns public root/package/lock/integration. No legacy, preview, friend baseline or shared-card changes.

Add `export * from "./components/OptionCards"` to the integrated root. Existing family barrel preserves runtime OptionCards and types OptionCardsProps, OptionCardsItem, OptionCardsSelectionType. No new dependency. Existing InlineMarkdownRenderer and committed getRowConfiguration are reused without copying or changing them.

Public built-package-root TDD: first test fails the missing export; the minimal extraction passes; two regression tests now cover controlled single/multiple selection, callback argument shape, native root/ref/style/attributes, markdown, missing-value filtering, top slots including0, individual/global disabled native click suppression, forwarded root click, empty/live updates. Raw red/green/build/type/lint evidence is retained under results/source.

Producer `/private/tmp/core-option-producer` is source-stage scratch with copied source and existing installed tooling via symlinks; only its temporary root barrel adds this family. Build, strict source types, two public DOM tests, formatting and semantic lint pass. These are not normal installed artifact or browser results. Public Goober emitted-CSS diagnostic is only a source check; real computed styles and initial stylesheet order remain to be tested.

Component logic/props are unchanged except a Goober root class import/attachment. Owned SCSS is converted to module-scope stock Goober, retaining class hooks and specificity with terminal :where selectors, native state selectors and exact768/480px container breakpoints. Effective button-reset declarations are retained. Base declarations precede container-query groups. No custom parser/injector/cache, new sx API or runtime patch.

Independent GPT6.1-Sol Spec and Standards reviews report zero actionable source/test findings. Reviewers did not run Chrome. Worker2 owns the first browser window and will prepare scoped normal-installed framework/order/theme/selection/keyboard/override checks after Worker1 integrates/freezes an exact artifact. No Chrome run yet. Native keyboard behavior and any missing arrow-key/roving behavior must be compared with legacy, not invented. The component does not update selected internally; consumers retain control. Final integrated CI/types/native/pruning belong Worker1.

Raw JSON/log evidence should be preserved byte-for-byte; any necessary narrow formatter exclusion belongs Worker1. No publication, merge, deprecation, issue closure or chart implementation.

## Prepared browser validation

`option-cards.browser.mjs` and its public-props fixture compare unchanged legacy SCSS/components against a normally installed core tarball. Required environment: CORE_CONSUMER, CORE_ARTIFACT_PATH, CORE_ARTIFACT_SHA256, CORE_ARTIFACT_REVISION, CORE_BROWSER_TOOLS, CORE_SASS_TOOLS, CORE_HOST_STYLES and CORE_BROWSER_RESULTS. `--prepare-only` verifies installed-file/tarball equality and bundles both arms without opening Chrome. The runner records immutable package/lock hashes, fixture/runner/bundle/host/legacy-CSS hashes and browser version; final package and lock checks guard against changes during the run.

The prepared matrix covers plain CSS/Tailwind3/Tailwind4 in both initial stylesheet orders, default/no/custom light/dark themes, nested/independent scopes, counts0–5 at450/480/481/700/768/769/900px, hover/focus, native click/Enter/Space/Tab skipping disabled options, controlled and parent-updated selection, single/multiple semantics, global/per-item disabled, explicit root and descendant overrides, refs/unmount/remount and host isolation. Initial stylesheet placement is a test fixture before React mounts, not production host-reordering code. No DOM mocks, forced pointer events or synthetic geometry. SSR/streaming/performance/memory and transition-frame parity are excluded.

Preparation against the installed OptionCards candidate passed bundle/provenance checks; strict fixture TypeScript and runner syntax checks pass. Both independent GPT6.1-Sol reviewers found the same hover-transition timing risk; the runner now settles the existing transition before the independent override-color assertion. No Chrome result is claimed by preparation. Final measurement must pin Worker1's confirmed frozen artifact.
