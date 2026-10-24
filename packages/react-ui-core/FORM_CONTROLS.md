# Form control slice (#10)

Base: reviewed PR20 head `48a877064e0a2039c2c6949959168dea077a5d49`. Branch: `codex/react-ui-core-form-controls`. This is an additive slice on PR20; no merge or later migration is authorized. Old React UI and friend baseline paths remain read-only.

## Ownership and dependency audit

Worker 1 owns package dependencies/root exports/shared support plus Buttons, FormControl/Hint, IconButton, Label, checkbox/radio/switch/toggle families. Worker 2 owns Calendar, DatePicker, Select, Slider/SliderBlock, Chips and OptionCards. Existing Button/Input/TextArea/theme APIs remain shared and unchanged unless a concrete new-package defect requires a conventional fix.

Early prerequisites:

- IconButton: DatePicker helpers import it. Buttons only needs its prop type plus existing Button.
- Existing FormControl context: already present; full FormControl and exported Hint will reuse it.
- Internal LayoutContext: Calendar/DatePicker use the default layout and internal context. Preserve the same file/API internally, without adding a public context export.
- useMultipleRefs and internalUtils/ref: Calendar/DatePicker ref wiring. Preserve the existing implementations and import paths.
- Label and the independent grouped controls require only their existing Radix primitives, React and clsx.

Runtime dependency edits stay with Worker 1. Proposed Radix ranges follow the old package: react-slot ^1.2.4, react-label ^2.1.1, react-checkbox ^1.1.3, react-radio-group ^1.2.2, react-switch ^1.1.2 and react-toggle-group ^1.1.2. Worker 2 will report the date/select/slider dependencies before integration. Preserve existing workspace lock entries; add only required new-package records/imports. No shared catalog/workspace-script expansion is planned.

OptionCards reaches InlineMarkdownRenderer and the small-card row helper. Inline markdown transitively reaches MarkdownRenderer, CodeBlock, citation/source/tooltip helpers and markdown runtime dependencies. That extends beyond the assigned control list. It was surfaced before implementation; no duplicate text renderer, simplified markdown replacement or broad migration is authorized implicitly. The affected work waits for a scope decision while independent controls proceed.

## Agreed validation boundary

Use the existing agreed seam: built/packed public root imports rendered through React, actual events/refs/native DOM, and real Chrome default/state/theme/override comparisons. One public behavior test fails before each minimal component extraction, then build/run it before proceeding. Do not write the entire migration test catalog first or reach into private contexts to manufacture a public guarantee. Inherited errors will be tested through public FormControl now that it is part of this slice.

Styles are hand-reviewed one-to-one SCSS conversions to stock module-scope css/native JSX, with existing CSS variables/light fallbacks. Existing native and attribute disabled states, exported parts/types, focus/keyboard, error and portal behavior remain the contract. No sx, custom parser/cache/guards/bridges or legacy production style inputs. SSR stays deferred. Existing ci remains active; final integrated tarball gets import/type/tree-shaking and Chrome plain/Tailwind v3/v4 checks. This record will be updated with per-slice red/green results and final limits.
