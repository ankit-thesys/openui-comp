## Problem Statement

The existing React UI combines reusable controls, charts and chat-oriented functionality. Consumers need a shared UI core and independently understandable use-case kits, without duplicated implementations or a difficult migration. The team also needs a styling approach that works in browser applications using plain CSS and Tailwind v3/v4 without maintaining custom compatibility patches.

## Solution

Introduce `@openuidev/react-ui-core` for reusable UI, all existing charts and shared themes. Introduce a chat kit whose components and AI-facing library have separate entries. Keep the old React UI read-only and available as a reference. Preserve existing public APIs and behavior wherever possible, and convert extracted styles one-to-one without relying on old SCSS or generated CSS.

Unmodified runtime Goober with unlayered styles and explicit consumer overrides is the candidate under evaluation. This specification is ready for scoped validation and planning; **styling acceptance and production migration remain gated by the evidence and decisions below**. Publishing this specification does not turn prior prototypes into a full compatibility approval.

## User Stories

1. As an application developer, I want to import reusable components and charts from one core package, so that I can build interfaces without importing a chat product.
2. As an application developer, I want to use root imports and corresponding public prop types, so that the first release has a simple stable entry point.
3. As an application developer, I want to receive only the code and styles needed by used components, so that a Button does not bring unrelated charts or chat libraries.
4. As an application developer, I want to have used components style themselves in the browser, so that I do not need manual CSS imports or styling setup commands.
5. As an existing consumer, I want to retain existing component props and expected appearance and behavior, so that migration does not require redesigning my application.
6. As an application developer, I want to use core beside plain CSS, so that component defaults remain usable and explicit overrides work.
7. As a Tailwind v3 consumer, I want to use documented important utilities for intentional overrides, so that I can customize components without global Tailwind configuration changes.
8. As a Tailwind v4 consumer, I want to use documented important utilities for intentional overrides, so that I can customize components without compatibility patches.
9. As a keyboard and assistive-technology user, I want to retain keyboard, focus and accessibility behavior, so that the migration does not make controls harder to use.
10. As an application developer, I want to retain native and attribute-based disabled semantics, so that visual overrides do not enable disabled interactions.
11. As an application developer, I want to retain existing size, variant, className and style options where supported, so that I do not have to learn a new styling API.
12. As a design-system consumer, I want to configure existing theme tokens through ThemeProvider, so that shared appearance remains consistent.
13. As an application developer, I want to retain useTheme and createTheme with their existing types, so that custom components and theme validation continue working.
14. As an application developer, I want to retain default themes, swatches and mode-preference helpers, so that I do not need to rebuild existing theme functionality.
15. As an application developer, I want to retain intended nested and portal theme behavior, so that dialogs and menus use their intended theme.
16. As a chart consumer, I want to receive the complete existing chart set and supporting visuals from core, so that I do not lose chart capabilities or install a separate visualization package.
17. As a chat developer, I want to import ModelSwitcher and follow-up components from the chat kit entry, so that chat-specific components have a clear owner.
18. As a chat developer, I want to import openuiChatLibrary through a separate library entry, so that component-only imports do not assemble an AI library unnecessarily.
19. As a kit maintainer, I want to keep component definitions, schemas, prompts and examples with the owning kit library, so that AI-facing behavior has a clear owner.
20. As a chat user, I want to see partial and final generated UI from the actual parser, so that streamed interfaces remain correct and interactive.
21. As a chat user, I want to retain applicable cancellation, history and resubmission behavior, so that ongoing conversations remain usable.
22. As a future kit author, I want to reuse core components, charts and themes, so that new kits do not duplicate shared implementations.
23. As a maintainer, I want to keep existing react-ui unchanged, so that the extraction does not destabilize the old package.
24. As a maintainer, I want to receive reports of old-package defects, so that I can decide on them without unauthorized fixes.
25. As an implementer, I want to use straightforward code and public tooling APIs, so that the implementation stays understandable and maintainable.
26. As a maintainer, I want to review proposed custom workarounds before implementation, so that dependency patches and hidden infrastructure do not accumulate.
27. As an implementer, I want to develop through confirmed public test boundaries using TDD, so that tests prove user-visible behavior rather than private implementation details.
28. As a reviewer, I want to see reproducible build, compatibility and visual results, so that I can distinguish demonstrated behavior from assumptions.
29. As a reviewer, I want to see stock-candidate chat and dashboard performance and memory measurements, so that I can assess runtime cost without misusing earlier prototype evidence.
30. As a release maintainer, I want to validate packed package artifacts before beta release, so that exports, peers and style dependencies work outside the monorepo.
31. As a maintainer, I want to generate export and ownership inventories from maintained source metadata, so that documentation does not become a second manual component catalog.
32. As a team lead, I want to review unresolved packaging and styling acceptance decisions explicitly, so that publication does not imply approval of unfinished work.
33. As an application developer, I want to see an explicit SSR support boundary, so that I do not mistake working browser styling for automatic streaming SSR support.

## Implementation Decisions

### Ownership and package interfaces

- Core owns the following 65 reusable component families, their existing exported subcomponents/types, and the full existing chart implementation set and supporting chart code. Charts are additional to the 65-family count; no separate visualization package is planned.

| Group | Count | Component families |
| --- | ---: | --- |
| Inputs and controls | 21 | `Button`, `Buttons`, `Calendar`, `CheckBoxGroup`, `CheckBoxItem`, `Chips`, `DatePicker`, `FormControl`, `IconButton`, `Input`, `Label`, `OptionCards`, `RadioGroup`, `RadioItem`, `Select`, `Slider`, `SwitchGroup`, `SwitchItem`, `TextArea`, `ToggleGroup`, `ToggleItem` |
| Layout and containers | 9 | `Accordion`, `Card`, `CardHeader`, `Carousel`, `Modal`, `SectionBlock`, `Separator`, `Steps`, `Tabs` |
| Text and presentation | 13 | `Callout`, `CodeBlock`, `IconTag`, `IconText`, `InlineHeader`, `InlineMarkdownRenderer`, `MarkDownRenderer`, `Tag`, `TagBlock`, `TextBlock`, `TextCallout`, `TextContent`, `TextContentWrapper` |
| Images | 5 | `Image`, `ImageBlock`, `ImageGallery`, `ImageText`, `ImageTextLarge` |
| Data and lists | 6 | `EditableTable`, `EntityList`, `ListBlock`, `ListItem`, `MetricIndicator`, `Table` |
| Composed cards | 5 | `CompositeCardBlock`, `ContextCardBlock`, `OverviewCardBlock`, `SnippetCardBlock`, `VisualCardBlock` |
| Citations and sources | 3 | `Citation`, `SourceFaviconImage`, `Sources` |
| Loading and help | 3 | `DotMatrixLoader`, `Skeleton`, `TooltipWrapper` |

- Core owns shared theme support, necessary local helpers and supporting contexts. Kits depend on core; core must not depend on kits. Do not automatically re-export the full headless runtime from core.
- The initial core API is root-only: approved components, charts and public prop types are exported from `@openuidev/react-ui-core`. Component subpaths are deferred. Include approved families even when the old root entry omitted them. Root-only imports do not relax tree shaking.
- Preserve primary root theme exports `ThemeProvider`, `useTheme`, `createTheme`, and types `Theme`, `ThemeMode`, `ThemeProps`. Preserve existing public default themes, swatches, theme types, `useSystemThemeMode`, `useThemeModePreference`, `ThemeModePreference`, `THEME_MODE_ATTRIBUTE`, and `THEME_MODE_STORAGE_KEY`. Audit the baseline helper inventory to avoid omissions. Keep underlying contexts internal unless a concrete consumer need is separately reviewed.
- Preserve existing prop names, signatures, defaults and intended behavior. Do not silently change provider scope, preference storage, system theme, nested themes or portal behavior. Required compatibility changes need explicit review.
- The provisional shared kits package is `@openuidev/kits`, subject to TL packaging approval. Chat component imports use `@openuidev/kits/react/chat`; the library entry is `@openuidev/kits/react/chat/libs`. Stable kit ownership should keep later packaging changes localized.
- Chat owns ModelSwitcher, FollowUpBlock, FollowUpItem and `openuiChatLibrary`, including required definitions, schemas, prompts, examples and support for equivalent behavior. The component entry must not import the assembled library as a side effect.
- Do not move the assembled `openuiLibrary` wholesale. Its future ownership remains a team decision. AgentInterface is excluded from extraction; prototype use of it is only a test fixture.
- OpenUIChat-related helpers, ToolCall and ToolResult have a separate provisional package boundary depending on core themes. Exact name, exported helper inventory and relation to the chat kit remain a blocking decision for that work; do not invent or silently absorb this package into core/chat.

### Styling and customization

- Convert all extracted component and necessary shared styles one-to-one from SCSS to the selected Goober definitions, preserving observable appearance, states, responsive rules and behavior. New package builds must not read old SCSS or generated CSS. The source migration is not already completed by prototype-generated objects.
- Evaluate stock Goober through public APIs only. No maintained parser fork, private server target, generated cascade guard, host-CSS rewriting, custom stylesheet bridge or consumer framework detector is authorized.
- Preserve existing component options and `className`/`style` where supported; do not assume every component accepts every DOM prop. Do not introduce `sx`, another styling language or a consumer-facing Goober requirement.
- Theme tokens support shared customization. Explicit overrides use scoped plain CSS importance or the documented per-utility important modifiers in Tailwind v3/v4. Ordinary utility classes are not guaranteed to beat component defaults. Do not enable global important settings or disable host preflight to manufacture compatibility.
- Browser consumers should not need manual component CSS imports, a separate styling setup command or a consumer build plugin. Validate actual package consumption rather than only source aliases.
- SSR is deferred from the current acceptance scope. Buffered SSR using documented extraction/insertion is an optional future evaluation, not an accepted implementation. No automatic SSR, streaming SSR or concurrent server stylesheet-isolation promise.

### Maintenance and implementation quality

- Existing React UI is read-only. No old-package fixes, refactors, backports or automatic synchronization. Record the baseline revision. Report baseline bugs and fix new-package defects conventionally; document any intentional difference from buggy legacy behavior.
- Keep implementations small, conventional and understandable, with short comments for non-obvious intent. Correctness and maintainability are simultaneous requirements.
- If a requirement appears to need patchwork, stop the affected work and report evidence, supported alternatives and tradeoffs for user review. Continue independent work. Do not claim that no alternative exists without evidence, or weaken tests to bypass a failure.
- Scope changes to shared workspace infrastructure must be surfaced before broadening the work. Avoid unrelated environment changes and global installations. Preserve historical experiments and user files.
- All repository writes and issue publication target the user's fork. No upstream writes or npm publication are authorized by this spec.

### Packaging and traceability

- Prepare build, declaration and package configuration following existing React UI conventions, including ESM/CJS where applicable. React/ReactDOM 19 is the agreed major support boundary; exact peer ranges, beta versions and runtime peers require dependency audit and validation before release.
- Check packed artifacts in a consumer application. Keep one maintained inventory for exports, ownership and style provenance; generate reference tables and detect stale/missing metadata rather than maintaining parallel catalogs manually. Human-authored guidance explains decisions and usage.
- Existing React UI remains available while new packages are evaluated. A deadline does not authorize publication or deprecation.

## Testing Decisions

### Public boundaries and TDD

Use the public boundaries discussed and confirmed in the conversation: a consumer importing built core/kit packages and rendering through their public React APIs, and a chat application consuming the kit library through the real parser/streaming runtime. These are the highest practical existing boundaries; avoid new private testing APIs.

Use the TDD skill for the batch POC and implementation slices: observe one meaningful failing behavior test, make the smallest conventional implementation change in the new package, then repeat. Do not write all tests for the entire migration before implementing any slice. Test external behavior, not serializer internals, caches or mocks that merely reproduce the implementation. Expected results must come from the agreed contract or independently checked baseline behavior.

### Acceptance checks

- Build, type checking and packed-package imports succeed. Public exported types and helpers match the agreed inventory. Relevant dependency/runtime errors fail the check.
- A Button-only root import does not include unrelated chart/chat code or emit unrelated styles. Imported and rendered component cases are checked separately. The extraction builds without access to old-package style inputs.
- Test real React prop forwarding and updates, interaction, native/attribute-based disabled behavior, keyboard/focus semantics, and relevant accessibility behavior. Include consumer overrides in normal, hover, disabled and relevant responsive/focus states.
- Browser compatibility matrix: Chrome with plain CSS, Tailwind v3 and v4, normal host preflight, and host styles before/after injected styles. Cover default appearance and explicit overrides, including unrelated host content. Do not generalize three component passes to the entire core.
- Compare meaningful appearance/behavior against the read-only baseline in isolated documents, plus separate old/new routes in one consumer application. Arbitrary mixing of old/new providers in one tree is not promised.
- Verify theme helpers, light/dark/system/preference behavior as applicable, nested scopes, independent scopes and relevant portal components. Preserve intended behavior; report existing deficiencies rather than changing global scope implicitly.
- Validate all existing chart families and relevant data/empty/loading/responsive/interaction behavior. Exercise forms, tables and charts through actual generated UI, not only static mock markup.
- Run real partial/final chat parsing and transport flows, applicable cancellation/history/resubmission and repeated mount/unmount. AgentInterface may be an unchanged integration fixture without being extracted.
- Measure browser performance and memory for stock Goober under chat and dashboard workloads with equal priority. Define numerical investigation/acceptance thresholds before measurement; record cold/warm behavior, paced and stress workloads, repeated runs, retained resources and longer soak behavior. Do not reuse earlier custom/static measurements as stock acceptance evidence.
- Record environment, revision, commands, raw results and coverage gaps. In-scope acceptance requires no known unresolved failures in agreed checks. “Error-free” is a correctness target, not proof that finite tests eliminate every possible defect. Failures block the affected requirement; deferred scope is explicitly labeled.

### Prior art and evidence limits

Existing ThemeProvider behavior tests, chart geometry/legend tests, and chat library action tests provide domain examples. The earlier browser catalog, real full-chat/parser fixtures, package-bundle controls and performance harnesses provide reusable test scenarios; their private implementation probes are not the new public TDD contract.

The stock candidate demonstrated bounded browser styling, actual chat/dashboard streaming, and direct-import unused-code/style behavior. The explicit override follow-up passed 60 sampled style checks for Button, Input and TextArea across six framework/order configurations, but applied classes through the DOM rather than React props. Broader state coverage, actual prop updates, full package consumption and stock performance/memory still need validation. Keep the static and patched experiments as historical comparisons only.

## Out of Scope

- Editing or repairing existing React UI, upstream repository writes, npm publication or announcing deprecation.
- Extracting AgentInterface; silently deciding the future of the assembled OpenUI library or unresolved helper package.
- A separate visualization package, additional production kits beyond chat, new customization APIs, or unrelated redesigns.
- Custom dependency patches or complex compatibility infrastructure without a separate explicit user decision.
- Current SSR/streaming SSR guarantees, non-Chrome certification, or production capacity claims from local diagnostics.
- Implementing the future source registry in this milestone. Preserve the future intent: copyable UI/chart/kit source, individual components and kits, explicit diff-based updates, shared component reuse, and kit-targeted AI registration separate from standalone installation.

## Further Notes

**Execution gate:** the `ready-for-agent` label indicates this specification is actionable for the defined validation/planning work. It does not override the explicit styling acceptance gate. Resolve remaining evidence and review the candidate before production migration slices begin. Helper-package work also waits for its inventory/name decision; release packaging waits for TL approval and exact metadata.

The previously requested Monday, October 26 submission target is a planning target, not a claim that all remaining validation or extraction fits that time. Re-estimate against approved slices and results; do not reduce correctness requirements to meet the date.

[Existing styling decision map](https://github.com/ankit-thesys/openui-comp/issues/4) and [streaming/performance investigation](https://github.com/ankit-thesys/openui-comp/issues/6) remain open. Publishing this spec does not close either investigation or accept static/runtime delivery implicitly.
