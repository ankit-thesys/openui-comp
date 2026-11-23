# Observed baseline behavior and coverage gaps, per family

Baseline commit: **`9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`**

What was actually observed when the unchanged legacy components were exercised,
and — explicitly — what this harness could **not** verify. Nothing listed as a
gap is asserted anywhere in `../tests/`; where a behavior could only be checked
in a weaker form, it is listed as a gap rather than asserted weakly and called
covered.

Prop/type/default details live in [behavior-matrix.md](./behavior-matrix.md);
defects in [defects.md](./defects.md).

---

## Harness capabilities and limits

`vitest 4.1.10` + `jsdom 26.1.0`, driving real user-style interactions through
`@storybook/test`'s bundled `@testing-library/user-event`. **There is no
Playwright in this repository and no browser run was performed.**

Verified to work in this harness:

- Mount/unmount/re-render of every in-scope family, with a single React instance
  shared with the legacy source.
- Pointer interaction (`userEvent.click`) including on portalled popup content.
- Keyboard interaction: Tab/Shift-Tab focus order, Space, Enter, Escape, arrow
  keys, Home/End.
- Radix portals (`Select`), `createPortal` + `@floating-ui/react-dom` portals
  (`DatePicker`), roving tabindex, `aria-*`/`data-*` state attributes.
- Native form participation via `<form>` + `FormData`.

Known jsdom shortfalls, and how they were handled:

| Shortfall                                     | Handling                                                                                                                                                                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No layout: every element measures 0×0         | No test asserts position, size, overflow or flip/collision behavior. `DatePicker`'s floating-ui placement and `Select`'s `sideOffset`/`position` are verified only as **props and classes reaching the DOM**, never as geometry. |
| No pointer capture (`hasPointerCapture` etc.) | Stubbed in `../setup/vitest.setup.ts`. Needed for `Select` and `Slider` to open/mount at all. Pointer-**drag** is therefore not exercised — see [G-4](#g-4).                                                                     |
| No `ResizeObserver`                           | Stubbed in `../setup/vitest.setup.ts`. The `Calendar` caption dropdowns use it for container-aware sizing; that sizing is not verified.                                                                                          |
| `scrollIntoView` missing                      | Stubbed. `Select`'s scroll-into-view of the active option is not verified.                                                                                                                                                       |
| No real CSS                                   | No test asserts anything visual. Class names are asserted as the component's _contract_, not as appearance.                                                                                                                      |

Every stub is a harness shim only; none changes legacy behavior. The shims are
listed here so no reader mistakes "the suite is green" for "this works in a
browser".

---

## Per-family observations

### Label — non-interactive

Renders a native `<label>` via Radix. `htmlFor` passes through natively and gives
real label→control activation. `required` appends a non-`aria-hidden` `*`, so the
accessible name gains the asterisk. `disabled` is class-only ([L-1](./defects.md#l-1)).
Creates **no** automatic association by itself.
**Gaps:** none applicable — all of its behavior is attribute-level.

### FormControl + Hint — non-interactive

`FormControl` is a `<div>` wrapper that publishes `{hasError}` on context and
imposes no structure on children: no id generation, no `aria-describedby`, no
label/control wiring. `Hint` consumes the context, and an explicit `hasError`
prop overrides it in both directions, reactively. `FormControl` drops native
props; `Hint` forwards them ([FC-1](./defects.md#fc-1)).
**Gaps:** `FormControl`'s layout (spacing/stacking) is CSS-only and unverified.

### Buttons — non-interactive

Layout `<div>` with `horizontal`/`vertical` variant classes, forwarding native
div props. No `role`, no toolbar semantics, no roving focus, no child
coordination; children render in order untouched.
**Gaps:** the `children` type restricts to `Button`/`IconButton` elements but
nothing is enforced at runtime; flex direction is CSS-only and unverified.

### CheckBoxItem

Radix `<button role="checkbox">`. Click and **Space** toggle; **Enter is inert**.
Controlled (`checked`) stays pinned while still reporting intent; uncontrolled
(`defaultChecked`) advances. `onChange` payload is a plain `boolean`. Disabled
sets native `disabled` + `data-disabled`, blocks clicks and is skipped by Tab.
`required` surfaces as `aria-required="true"`. The whole row — label _and_
description — is a click target. Nested labels ([CB-1](./defects.md#cb-1));
`name`/`value` need a `<form>` ([CB-2](./defects.md#cb-2)).
**Gaps:** Radix's `indeterminate` state is unreachable through this prop surface,
so it is neither tested nor documented as supported.

### CheckBoxGroup

Presentational only: a `<div>` with a variant class. No `role`, no value
management, no context. Children keep fully independent state — verified by
toggling one item and asserting the sibling is untouched. Drops native props.
**Gaps:** none applicable — there is no group behavior to exercise.

### RadioGroup + RadioItem

Radix `role="radiogroup"` with `role="radio"` children. Click selects and emits
`onValueChange(value)`; single-select is enforced by the primitive. Clicking the
label **or the description** selects (container `<label>`). `defaultValue` works
uncontrolled; a `value` prop pins the state while still reporting intent, and a
consumer-pushed `value` is reflected. Roving tabindex gives one tab stop, and the
initial stop is the checked item. **Space selects** the focused item. Group-level
and per-item `disabled` both work, and a disabled item is skipped by Tab.
Nested labels ([R-1](./defects.md#r-1)); `style` hits the control ([R-2](./defects.md#r-2)).
**Gaps:** [G-1](#g-1) (arrow-key _selection_).

### SwitchItem + SwitchGroup

Radix `<button role="switch">` with a thumb. Click, **Space and Enter** all
toggle — Enter works here but not on `CheckBoxItem`. Controlled/uncontrolled and
disabled behave as `CheckBoxItem`. The label is a click target; **the description
is not** ([S-1](./defects.md#s-1)). `SwitchGroup` is presentational only, same
contract as `CheckBoxGroup`.
**Gaps:** none beyond the shared form-participation note ([CB-2](./defects.md#cb-2)).

### ToggleGroup + ToggleItem

`type="single"` renders `role="radio"` children and emits the value string,
emitting **`""`** (not `undefined`) when the active item is re-clicked.
`type="multiple"` renders `role="button"` + `aria-pressed` and emits the full
`string[]`. `defaultValue` works uncontrolled; `value` pins. One tab stop with
arrow-key focus movement; **Enter activates**. Group-level and per-item `disabled`
both work. Missing from the root barrel ([T-1](./defects.md#t-1)); not
`forwardRef` ([T-2](./defects.md#t-2)).
**Gaps:** [G-2](#g-2) (React 18 `ref`).

### Chips

`role="listbox"` + `role="option"` buttons, `type="button"` set explicitly.
**Fully controlled** — no internal state and no uncontrolled mode, so without a
consumer updating `selected` the UI is inert. `onToggle` emits only the toggled
value, identically for select and deselect, so the callback alone cannot
distinguish them. Items with a falsy `value` are dropped and a missing `items`
array is tolerated. Group-level and per-item `disabled` both work; a disabled chip
keeps its selected styling. Every enabled chip is its own tab stop; Enter and
Space activate; arrow keys do nothing ([C-3](./defects.md#c-3)). `type` does not
constrain selection ([C-2](./defects.md#c-2)).
**Gaps:** none applicable.

### OptionCards

Same controlled shape as `Chips`, defaulting to `type="single"`
([OC-1](./defects.md#oc-1)) with `role="radiogroup"`/`role="radio"` +
`aria-checked`. Titles and subtitles render through `InlineMarkdownRenderer`, so
`**bold**` becomes a `<strong>` — markdown, not literal text. Items pack into
rows of up to three, and an odd item count adds a grid modifier class. Keyboard
behavior matches `Chips` ([OC-2](./defects.md#oc-2)).
**Gaps:** the responsive row/grid behavior is CSS-only and unverified;
`getRowConfiguration` is exercised only at 3 items, not across the full range.

### IconButton

`<button>` by default, or the slotted child under `asChild` (verified with an
`<a href>`, where classes and the icon span merge onto the link and `onClick`
still fires). Children render **before** the icon span. All variant/size/shape/
appearance maps verified exhaustively. `disabled` blocks clicks and Tab. Click,
Enter and Space all fire `onClick`. No accessible name is derived — an icon-only
button is unnamed unless the consumer supplies one. No default `type`
([IB-1](./defects.md#ib-1)).
**Gaps:** none applicable.

### Slider

Radix `role="slider"` thumbs with correct `aria-valuemin`/`max`/`now`.
Uncontrolled defaults to `[min]`; `defaultValue` seeds it and later changes are
ignored; a `value` prop pins the DOM while still emitting `onValueChange`, and
adding `value` later takes over immediately. **Keyboard fully exercised**: arrow
keys step by `step`, Home/End jump to the bounds, and values clamp at `min`/`max`.
Multi-thumb renders one thumb per value with per-thumb indicators, and the
hardcoded `minStepsBetweenThumbs={1}` is observable — a lower thumb cannot reach
the upper one. `formatNumber`'s compact boundary is pinned at `999` → `"999"`,
`1000` → `"1k"`, `1500` → `"1.5k"`, including live updates as the value crosses 1000. `disabled` adds the disabled class, blocks keyboard input, is skipped by Tab,
and **hides the value indicator entirely**. Discrete dots need `step`
([SL-1](./defects.md#sl-1)).
**Gaps:** [G-4](#g-4) (pointer drag).

<a id="sliderblock"></a>
**`SliderBlock`** is exported from `Slider/index.ts` and is therefore part of this
family's public surface, but it composes `Input` — owned by issue #9 — and
`Select`. Per #19's instruction not to duplicate Worker 2's suites, it is
**documented in the matrix and deliberately left untested here**. Its own props
(`label: string` required, `isStreaming?: boolean`, plus `SliderProps` minus
`value`/`defaultValue`) and its debounced input→slider synchronization are
recorded as an explicit gap, [G-5](#g-5).

### Select

Trigger renders `<button type="button" role="combobox">` with `data-placeholder`
until a value exists. Content is **portalled to `document.body`**, mounts on open
and unmounts on close, and Radix sets `aria-hidden="true"` on everything outside
the open popup — which is why the tests hold the trigger by reference and query
popup content from `document`. Full interaction verified both ways: click-open →
click-option, and Tab → Enter → ArrowDown → Enter. `onValueChange` emits the
item's `value` while the trigger displays its **label**. Choosing closes the
popup; Escape closes it and returns focus to the trigger. `defaultValue` works
uncontrolled, `value` pins while still reporting intent, and the chosen option
shows `aria-selected="true"` when reopened. Root `disabled` prevents opening and
Tab; a disabled item is `aria-disabled` and unclickable. `showTick` toggles the
check wrapper; `SelectGroup`/`SelectLabel`/`SelectSeparator` all render inside the
popup. Defects: [SE-1](./defects.md#se-1) (crash), [SE-2](./defects.md#se-2)
(`textValue`), [SE-3](./defects.md#se-3) (size).
**Gaps:** typeahead (type-to-select) is **not** tested — it depends on the
`textValue` plumbing that SE-2 breaks, and asserting the broken behavior as
"covered" would be misleading; recorded as [G-6](#g-6). Popup geometry,
`position="item-aligned"` vs `"popper"` placement, and the `sideOffset` are
verified only as attributes, never as layout.

### Calendar

Renders `react-day-picker 9.14.0` inside `div.openui-calendar-container`. The
injected `captionLayout="dropdown"` is overridable, and the caption dropdowns are
**openui `Select`s** (`role="combobox"`), not native `<select>` elements — so the
caption inherits `Select`'s behavior and risks. `classNames` merges per key.
Single mode marks `aria-selected`, reports the clicked `Date`, and reports
`undefined` when the selected day is re-clicked; range mode marks every day in
the range (7 for Mar 14–20) and completes a range across two clicks. `disabled`
matchers disable day buttons and suppress `onSelect`. Tab order is previous-month,
next-month, then a single grid tab stop; arrows move by day and week and Enter
selects. `selected` is honored on mount but **not re-read on re-render**
([CA-2](./defects.md#ca-2)); a consumer `components` object replaces the injected
map ([CA-1](./defects.md#ca-1)).
**Gaps:** the caption dropdowns' _interaction_ (opening the month/year Select and
choosing a value) is not tested — it is `Select` behavior, already covered
directly, and the container-aware sizing it depends on needs real layout; see
[G-7](#g-7). `layout`-context-driven class sets are exercised only at the default
`"fullscreen"`. `multiple` mode is not exercised.

### DatePicker

Trigger is a `<div onClick>` showing `format(date, "MMM d, yyyy")` or the
placeholder; open/closed state is conveyed by **class, not ARIA**. The popup
portals to `document.body`, opens and toggles on trigger click, closes on an
outside `mousedown`, stays open when its own content is clicked, and **does not
close on Escape**. Full interactions verified: choosing a single date (reports a
`Date`, updates the label) and building a range across two clicks (half-open
range first, then the complete range, with the label tracking both). Works with
no setter at all, purely on internal state. Controlled values render and report
correctly. Four defects live here: [DP-1](./defects.md#dp-1) (keyboard),
[DP-2](./defects.md#dp-2) (cannot clear), [DP-3](./defects.md#dp-3) (stuck open),
[DP-4](./defects.md#dp-4) (no close-on-select).
**Gaps:** floating-ui placement, flip and `autoUpdate` need real layout and are
unverified ([G-8](#g-8)). `touchstart` dismissal is not exercised (only
`mousedown`). Keyboard interaction **cannot** be tested because DP-1 makes the
control keyboard-unreachable — that is recorded as the defect, not worked around.

### Composition (runnable consumer)

`../fixtures/LegacyConsumerApp.tsx` wires all families together and is driven
end-to-end in `../tests/LegacyConsumer.baseline.test.tsx`. One observation worth
passing to consumers: in a composed app the ARIA roles **collide** — `Chips` uses
`role="listbox"`/`"option"` exactly as `Select`'s popup does, `OptionCards` uses
`role="radiogroup"`/`"radio"` exactly as `RadioGroup` does, and the `Calendar`
caption adds two more `role="combobox"` elements. A bare `getByRole` query is
therefore ambiguous, and the consumer tests scope every query to a section.

---

## Coverage gaps

<a id="g-1"></a>

### G-1 — RadioGroup arrow-key _selection_ (not focus)

In a browser, Radix `RadioGroup` selects the item that arrow-key focus lands on.
Under jsdom the focus move happens (asserted) but the auto-select does not fire.
`tests/Radio.baseline.test.tsx` renders the raw `@radix-ui/react-radio-group`
primitive as a **control group** and gets the identical result, which establishes
that the openui wrapper is not the cause. Arrow-key _selection_ is therefore
unverified at this baseline. Needs a real browser.

<a id="g-2"></a>

### G-2 — ToggleGroup/ToggleItem `ref` on React 18

`T-2` is version-dependent. This harness installs React 19.2.4 only, where the
`ref` happens to work. The React 18 behavior (expected: `ref` stays `null`) is
unverified. Needs an install against the lower bound of the peer range.

<a id="g-3"></a>

### G-3 — Real-browser activation of the nested labels

`CB-1`/`R-1` nest `<label>` elements with the same `for`. jsdom produces a single
activation per click. Browsers may double-activate (check then immediately
uncheck) for nested labels; that is **not** verified here, and no claim is made
either way. Needs a real browser.

<a id="g-4"></a>

### G-4 — Slider pointer drag

Only keyboard value changes are exercised. Dragging a thumb needs pointer
capture and real layout, both absent in jsdom (pointer capture is stubbed purely
so the component mounts). Track-click-to-jump is likewise unverified.

<a id="g-5"></a>

### G-5 — `SliderBlock`

Exported from the Slider family but composes `Input`, which issue #9 owns.
Deliberately not tested here to avoid duplicating Worker 2's suite. Its own
surface (`label`, `isStreaming`, the debounced input↔slider sync, and the
validation error path) is documented but unverified.

<a id="g-6"></a>

### G-6 — Select typeahead

Type-to-select depends on Radix's `textValue`, which `SE-2` prevents from ever
being set. Rather than assert the broken behavior and call it covered, typeahead
is left unverified and flagged. Re-test once `SE-2` is addressed.

<a id="g-7"></a>

### G-7 — Calendar caption dropdown interaction

Opening the month/year dropdowns and choosing a value is not exercised. They are
openui `Select`s whose behavior is covered directly in the Select suite, and
their container-aware sizing depends on `ResizeObserver` plus real layout (both
stubbed/absent). Also unverified: `layout` context values other than
`"fullscreen"`, and `mode="multiple"`.

<a id="g-8"></a>

### G-8 — Popup positioning for DatePicker and Select

`@floating-ui/react-dom` placement, `flip()`, `offset()` and `autoUpdate` for the
DatePicker, and Radix's `position`/`sideOffset`/collision handling for Select, are
all verified only as props and classes reaching the DOM. No geometry is asserted,
because jsdom has no layout. `touchstart`-based dismissal of the DatePicker is
also unexercised.

<a id="g-9"></a>

### G-9 — Visual, theming and SSR

No test asserts appearance; there is no real CSS in jsdom. `ThemeProvider`'s
`portalThemeClassName` is consumed by `SelectContent` and the DatePicker popup,
but only the default (empty) value is exercised — no themed-portal case. Nothing
here runs under `renderToString`, so SSR behavior of these families is unverified
even though the package's own existing tests are SSR-based. RTL/`dir="rtl"` is
untested throughout.

<a id="g-10"></a>

### G-10 — No browser or performance run

Per #19's coordination note, no browser automation was run and no timed
performance measurement was taken, so no execution window needed to be
coordinated. Everything above is jsdom-only.
