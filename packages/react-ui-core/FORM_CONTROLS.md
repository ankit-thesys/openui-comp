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

Preserved legacy limitations are investigated separately rather than silently redesigned here. Friend PR21’s Calendar controlled-state claim is not accepted evidence because its test omitted onSelect; a controlled check must include it. Friend reports about Select hideDropdownIcon and DatePicker require independent reproduction. IconButton retains its native default button type, including form submission when no type is supplied. SSR remains deferred.

Final combined-artifact evidence is recorded below after validation. Worker 2’s source-scoped results under Chips/**tests**/results are historical input evidence, not certification of this combined package.
