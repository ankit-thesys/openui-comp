# Form control slice (#10)

Base: reviewed PR20 head `48a877064e0a2039c2c6949959168dea077a5d49`. Branch: `codex/react-ui-core-form-controls`. This is an additive slice on PR20; no merge or later migration is authorized. Old React UI and friend baseline paths remain read-only.

## Ownership and dependency audit

Worker 1 owns package dependencies/root exports/shared support plus Buttons, FormControl/Hint, IconButton, Label, checkbox/radio/switch/toggle families. Worker 2 owns Calendar, DatePicker, Select, Slider/SliderBlock, Chips and OptionCards. Existing Button/Input/TextArea/theme APIs remain shared and unchanged unless a concrete new-package defect requires a conventional fix.

Early prerequisites:

- IconButton: Buttons needs its prop type plus existing Button. The active DatePicker graph does not need the older IconButton helper files; those unreachable helpers were not copied.
- Existing FormControl context: already present; full FormControl and exported Hint will reuse it.
- LayoutContext: preserve its existing public context/provider/hook exports. Calendar/DatePicker consume it for layout.
- useMultipleRefs and internalUtils/ref: Calendar/DatePicker ref wiring. Preserve the existing implementations and import paths.
- Label and the independent grouped controls require only their existing Radix primitives, React and clsx.

Runtime dependency edits stay with Worker 1. Proposed Radix ranges follow the old package: react-slot ^1.2.4, react-label ^2.1.1, react-checkbox ^1.1.3, react-radio-group ^1.2.2, react-switch ^1.1.2 and react-toggle-group ^1.1.2. Worker 2 will report the date/select/slider dependencies before integration. Preserve existing workspace lock entries; add only required new-package records/imports. No shared catalog/workspace-script expansion is planned.

OptionCards reaches InlineMarkdownRenderer and the small-card row helper. Inline markdown transitively reaches MarkdownRenderer, CodeBlock, citation/source/tooltip helpers and markdown runtime dependencies. That extends beyond the assigned control list. It was surfaced before implementation; no duplicate text renderer, simplified markdown replacement or broad migration is authorized implicitly. The user explicitly deferred OptionCards until those later prerequisites exist. This slice does not claim complete issue #10 closure.

## Agreed validation boundary

Use the existing agreed seam: built/packed public root imports rendered through React, actual events/refs/native DOM, and real Chrome default/state/theme/override comparisons. One public behavior test fails before each minimal component extraction, then build/run it before proceeding. Do not write the entire migration test catalog first or reach into private contexts to manufacture a public guarantee. Inherited errors will be tested through public FormControl now that it is part of this slice.

Styles are hand-reviewed one-to-one SCSS conversions to stock module-scope css/native JSX, with existing CSS variables/light fallbacks. Existing native and attribute disabled states, exported parts/types, focus/keyboard, error and portal behavior remain the contract. No sx, custom parser/cache/guards/bridges or legacy production style inputs. SSR stays deferred. Existing ci remains active; final integrated tarball gets import/type/tree-shaking and Chrome plain/Tailwind v3/v4 checks. This record will be updated with per-slice red/green results and final limits.

## Implementation record

Each primitive family had a public-root missing-feature failure before extraction, then a passing React DOM interaction test: IconButton, Label, FormControl/Hint, Buttons, checkbox, radio, switch and toggle. Tests use actual Radix controls and callbacks, native refs, controlled/uncontrolled values and disabled behavior. JSDOM exposes its real HTMLFormElement/getComputedStyle to Radix; these are test-environment globals, not product patches.

Production styles use module-level stock Goober css calls and native/Radix JSX. The Chrome reference caught and corrected a secondary-text fallback alpha (0.6). Radio descendant hover uses native :enabled:hover instead of :hover:not(:disabled), whose descendant form Goober misserializes; the button state is equivalent. No Goober internals were changed. Baseline dependency resolution uses the installed candidate package’s dependency graph only in the comparison arm; the candidate imports no legacy source or styles.

Preserved legacy limitations are investigated separately rather than silently redesigned here. Friend PR21’s Calendar controlled-state claim is not accepted evidence because its test omitted onSelect; a controlled check must include it. The independent legacy/extracted Chrome comparison confirms matching Select hideDropdownIcon crashes and textValue visible-text behavior, DatePicker controlled clearing restoring a stale date, isOpen=true staying open without its setter, and a non-keyboard-operable div trigger. The isOpen case is a controlled-prop usage constraint, not inherently a defect. These inherited cases are disclosed for separate scope review; this extraction does not silently fix them. IconButton retains its native default button type, including form submission when no type is supplied. SSR remains deferred.

Final combined-artifact evidence lives in `evidence/form-controls`. Worker 2’s source-scoped results under `Chips/__tests__/results` are historical input evidence, not certification of this combined package.

## Final combined results

Exact installed tarball SHA256: `1bbac01d3961dc9bf8d075070149a62328072133fa9dcdedec78df71b4bfde66` (175,523 bytes). Producer production revision: `6839fbd9d`; subsequent edits add validation/evidence only.

- Complete scoped CI passed: 32 Node tests, formatting, lint, typecheck, isolated build, normal packed-consumer installation, publint and attw.
- The normally installed tarball passed 21 public component/import/tree-shaking tests and strict Bundler, NodeNext ESM and NodeNext CommonJS consumers with skipLibCheck false.
- Chrome 156 passed all 42 combined framework/order cases: 45,912 primitive and 45,690 composite paired element/style snapshots (91,602 total). Each matrix covers five theme states, default/interaction/disabled styles, explicit important overrides and narrow/wide layouts. Actual SVG stroke properties are included for primitive controls.
- Six composite interaction scenarios and Calendar controlled rerender/layout parity in mobile, fullscreen, tray and copilot passed.
- The final tarball separately reproduces the disclosed inherited risks. These diagnostic matches are not desired-behavior passes. No universal error-free or SSR/performance certification is implied.
- Independent standards review: 0 findings. Independent spec review: 0 findings. OptionCards remains explicitly deferred; issue #10 is not closed.

Evidence and reproduction: `evidence/form-controls/README.md`. Legacy production and friend-baseline directories are unchanged. This branch is ready for a stacked draft review targeting `codex/react-ui-core-first-slice-pr`, with inherited limitations disclosed; no merge or publication is authorized.
