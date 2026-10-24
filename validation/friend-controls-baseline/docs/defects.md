# Baseline defects and discrepancies

Baseline commit: **`9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`**

> **Updated by issue #23.** SE-1, SE-2, DP-1, DP-2, DP-3 and CB-1/R-1
> were re-examined in real Chrome; CA-2 was corrected with controlled and
> uncontrolled Calendar tests in jsdom.
> One was **withdrawn** (CA-2 — it was a test-authoring error, not a defect) and
> two were **narrowed** (SE-2, CB-1/R-1). The classified results, with raw run
> output, are in [verification-ledger.md](./verification-ledger.md); that ledger
> is authoritative where it and this file disagree.

Per issue #19, these are **findings, not work items for this ticket**. Nothing in
`packages/react-ui` was changed, and no test was written to assert a desired
behavior that the baseline does not have. Every entry below is reproduced by a
passing test that asserts the behavior **as it actually is**.

Severity is this harness's own read, for triage only:
**high** = broken or inaccessible for a supported use of the documented API ·
**medium** = silently wrong or inconsistent, with a consumer-side workaround ·
**low** = cosmetic, naming, or packaging ·
**WITHDRAWN** = re-examined under #23 and found not to be a defect.

| ID            | Family                     | Severity               | One line                                                                         |
| ------------- | -------------------------- | ---------------------- | -------------------------------------------------------------------------------- |
| [SE-1](#se-1) | Select                     | **high**               | `hideDropdownIcon` crashes the render                                            |
| [DP-1](#dp-1) | DatePicker                 | **high**               | Trigger is a bare `<div>` — keyboard-unreachable                                 |
| [DP-2](#dp-2) | DatePicker                 | **high**               | A controlled value cannot be cleared                                             |
| [DP-3](#dp-3) | DatePicker                 | **high**               | `isOpen` without `setIsOpen` is stuck open                                       |
| [SE-2](#se-2) | Select                     | medium                 | `textValue` renders as visible text (typeahead verified working)                 |
| [SE-3](#se-3) | Select                     | medium                 | Trigger and popup disagree when both set `size`                                  |
| [IB-1](#ib-1) | IconButton                 | medium                 | No default `type`, so it submits forms                                           |
| [FC-1](#fc-1) | FormControl, groups, items | medium                 | Closed props drop native/ARIA attributes                                         |
| [CB-1](#cb-1) | CheckBoxItem               | low                    | Nested `<label>` elements — invalid HTML, no behavioral consequence in Chrome    |
| [R-1](#r-1)   | RadioItem                  | low                    | Nested `<label>` elements — invalid HTML, no behavioral consequence in Chrome    |
| [C-3](#c-3)   | Chips                      | medium                 | `listbox`/`option` roles without listbox keyboard semantics                      |
| [OC-2](#oc-2) | OptionCards                | medium                 | `radiogroup`/`radio` roles without radio keyboard semantics                      |
| [CB-2](#cb-2) | CheckBoxItem, SwitchItem   | medium                 | `name`/`value` do nothing outside a `<form>`                                     |
| [CA-1](#ca-1) | Calendar                   | medium                 | A consumer `components` object silently replaces the caption dropdowns           |
| [SL-1](#sl-1) | Slider                     | medium                 | `variant="discrete"` without `step` renders no dots                              |
| [T-1](#t-1)   | ToggleGroup, ToggleItem    | medium                 | Not exported from the package root                                               |
| [DP-4](#dp-4) | DatePicker                 | low                    | Popup does not close after a date is chosen                                      |
| [S-1](#s-1)   | SwitchItem                 | low                    | Description is not a click target (differs from siblings)                        |
| [C-2](#c-2)   | Chips                      | low                    | `type="single"` does not enforce single selection                                |
| [OC-1](#oc-1) | OptionCards                | low                    | Default `type` differs from `Chips`                                              |
| [T-2](#t-2)   | ToggleGroup, ToggleItem    | low                    | Not `forwardRef`; `ref` works only on React 19                                   |
| [R-2](#r-2)   | RadioItem                  | low                    | `style` lands on the control, not the row                                        |
| [L-1](#l-1)   | Label                      | low                    | `disabled` is presentation only                                                  |
| [CA-2](#ca-2) | Calendar                   | ~~high~~ **WITHDRAWN** | Not a defect — test-authoring error, see [ledger](./verification-ledger.md#ca-2) |

---

<a id="se-1"></a>

## SE-1 — `SelectTrigger hideDropdownIcon` crashes the render · **high**

**Source:** `packages/react-ui/src/components/Select/Select.tsx:99-101`
**Test:** `tests/Select.baseline.test.tsx` → "CRASHES when hideDropdownIcon is set"

```tsx
<SelectPrimitive.Icon asChild>
  {!hideDropdownIcon && <ChevronDown className="openui-select-trigger-icon" />}
</SelectPrimitive.Icon>
```

With `hideDropdownIcon={true}` the expression evaluates to `false`. Radix's `Slot`
requires exactly one React element child, so it throws. The prop is declared in
`SelectTriggerProps` (`Select.tsx:68`) and is therefore unusable at this baseline.

Minimal reproduction:

```tsx
<Select>
  <SelectTrigger hideDropdownIcon aria-label="Currency">
    <SelectValue placeholder="Pick one" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="eur">Euro</SelectItem>
  </SelectContent>
</Select>
```

Observed: render throws `Primitive.span failed to slot onto its children. Expected a single React element child or 'Slottable'.`

---

<a id="dp-1"></a>

## DP-1 — DatePicker trigger is a bare `<div>`, keyboard-unreachable · **high**

**Source:** `.../DatePicker/helpers/components/FloatingDatePickerRenderer.tsx:20-31`
**Tests:** `tests/DatePicker.baseline.test.tsx` → "renders the trigger as a plain `<div>`…", "is UNREACHABLE by keyboard"

The trigger is a `<div onClick>` with no `role`, no `tabIndex`, no keyboard
handler, no `aria-expanded` and no `aria-haspopup`.

```tsx
<DatePicker />
// then: press Tab
```

Observed: focus goes to `document.body`; the trigger is never focused, and
`Enter` cannot open the popup. A keyboard-only user cannot operate the control at
all. There is also no accessible `role`/name for assistive technology.

---

<a id="dp-2"></a>

## DP-2 — A controlled DatePicker value cannot be cleared · **high**

**Source:** `packages/react-ui/src/components/DatePicker/DatePicker.tsx:49-57` (and `:59-67` for range), with `:73-74`
**Tests:** `tests/DatePicker.baseline.test.tsx` → "CANNOT be cleared once a date has been picked while controlled", "has the same clearing defect in range mode"

```ts
const selectedDateHandler = (selectedDate?: Date) => {
  if (selectedSingleDate) {
    // guards on the VALUE's truthiness…
    setSelectedSingleDate?.(selectedDate);
    return;
  }
  setSelectedSingleDate?.(selectedDate);
  setInternalSelectedDate(selectedDate); // …so this also runs when controlled-but-empty
};
```

The guard tests whether the current value is truthy, not whether the prop was
_provided_. A consumer that starts controlled-and-empty therefore also seeds
internal state on the first pick. Because the render reads
`selectedSingleDate ?? internalSelectedDate` (`:73`), resetting the controlled
value to `undefined` does not clear the display — the stale internal date
resurfaces.

Minimal reproduction:

```tsx
const [date, setDate] = useState<Date | undefined>(undefined);
<>
  <button onClick={() => setDate(undefined)}>clear</button>
  <DatePicker mode="single" selectedSingleDate={date} setSelectedSingleDate={setDate} />
</>;
// open the picker, choose a day, then press "clear"
```

Observed: the trigger keeps showing the chosen date instead of returning to
`"Select a date"`.

---

<a id="dp-3"></a>

## DP-3 — `isOpen` without `setIsOpen` is permanently stuck · **high**

**Source:** `packages/react-ui/src/components/DatePicker/DatePicker.tsx:77-78`
**Test:** `tests/DatePicker.baseline.test.tsx` → "is STUCK OPEN when isOpen is given without setIsOpen"

```tsx
isOpenFromParent={isOpen ?? internalIsOpen}
setIsOpenFromParent={setIsOpen ?? setInternalIsOpen}
```

The two lines disagree about who owns the state. With `isOpen` supplied but no
setter, writes go to the **internal** state while reads still prefer the **prop**,
so every update is invisible.

```tsx
<DatePicker isOpen />
// then: click the trigger, or click outside
```

Observed: the popup stays open permanently — it cannot be dismissed by the
trigger, by an outside click, or by Escape. Both props are independently
optional in `DatePickerProps` (`:13-14`), so this combination is type-legal.

---

<a id="ca-2"></a>

## CA-2 — WITHDRAWN · not a defect

**This finding was wrong and is withdrawn.** It was filed as high severity and
attributed upstream to react-day-picker. Both the severity and the attribution
were unsupported.

The #19 test supplied `selected` but omitted `onSelect`, which in
react-day-picker 9.14.0 selects the **uncontrolled** code path — and the
raw-DayPicker control group shared the same omission, so it corroborated the
mistake instead of catching it. `onSelect` is the controlled/uncontrolled switch
(`selection/useSingle.js:13-14`): with it, `selected` is read from the prop on
every render and updates ARE reflected; without it, the prop seeds `useState`
once and later changes are correctly ignored.

Controlled Calendar re-render works correctly. Verified both ways on the OpenUI
Calendar and the pinned DayPicker in `tests/Calendar.baseline.test.tsx`.

Full correction, evidence and the lesson:
[verification-ledger.md#ca-2](./verification-ledger.md#ca-2).

The original observation survives only as the **uncontrolled** test, which is
expected behavior. It must not be cited as proof of a controlled bug.

---

<a id="se-2"></a>

## SE-2 — `SelectItem textValue` renders as visible text and never reaches Radix · medium

**Source:** `packages/react-ui/src/components/Select/Select.tsx:176, 197`
**Test:** `tests/Select.baseline.test.tsx` → "renders `textValue` as EXTRA VISIBLE TEXT instead of forwarding it to Radix"

`textValue` is destructured **out** of the props passed to `SelectPrimitive.Item`
(`:176`) and rendered in its own span (`:197`). In Radix, `textValue` is the
typeahead string used when an item's children are not plain text; it is never
meant to render.

```tsx
<SelectItem value="eur" textValue="Euro currency">
  Euro
</SelectItem>
```

Observed: the option's text content is `"EuroEuro currency"`, and Radix's real
`textValue` is left unset. The prop name collides with a Radix prop of the same
name but different meaning.

**Narrowed by #23:** typeahead was verified in Chrome and still **works**,
because Radix falls back to the rendered text content. The defect is the visible
duplication and the prop-name collision, not broken typeahead — see
[the ledger](./verification-ledger.md#se-2).

---

<a id="se-3"></a>

## SE-3 — Trigger and popup disagree when both declare a `size` · medium

**Source:** `packages/react-ui/src/components/Select/Select.tsx:25-27` and `:85-89`
**Test:** `tests/Select.baseline.test.tsx` → "leaves trigger and content DISAGREEING when both declare a size"

Two effects write the same shared context:

- `SelectTrigger` pushes its own `size` into the context (`:85-89`).
- `Select` resets the context back to the root `size` (`:25-27`).

Child effects run before parent effects, so the root wins the context while the
trigger keeps its own class.

```tsx
<Select size="sm">
  <SelectTrigger size="lg" aria-label="Currency">
    …
  </SelectTrigger>
  <SelectContent>…</SelectContent>
</Select>
```

Observed: trigger gets `openui-select-trigger-lg`, popup gets
`openui-select-content-sm` — the dropdown is sized differently from the control
that opened it. The write-back also makes a child's render mutate an ancestor's
state, which is fragile independent of the visual mismatch.

---

<a id="ib-1"></a>

## IB-1 — IconButton has no default `type`, so it submits forms · medium

**Source:** `packages/react-ui/src/components/IconButton/IconButton.tsx:71-84`
**Test:** `tests/ButtonsIconButton.baseline.test.tsx` → "does NOT set type=button, so it submits inside a form"

`type` is never defaulted, so the native default `"submit"` applies.

```tsx
<form onSubmit={onSubmit}>
  <IconButton icon={<TrashIcon />} aria-label="Delete row" />
</form>
// then: click the icon button
```

Observed: the form submits. An icon-only delete/clear action inside a form
therefore submits it unless the consumer remembers `type="button"`. `Chips`
(`Chips.tsx:53`) and `OptionCards` (`OptionCards.tsx:82`) both set `type="button"`
explicitly, so the inconsistency is internal to the package.

---

<a id="fc-1"></a>

## FC-1 — Closed props interfaces silently drop native and ARIA attributes · medium

**Source:** `FormControl/FormControl.tsx:12`, `CheckBoxGroup/CheckBoxGroup.tsx:21`, `SwitchGroup/SwitchGroup.tsx:20`, `CheckBoxItem/CheckBoxItem.tsx:20`, `RadioItem/RadioItem.tsx:16`, `DatePicker/DatePicker.tsx:22-32`
**Tests:** `tests/FormControl.baseline.test.tsx` → "DOES NOT forward unknown/native props…"; `tests/CheckBox.baseline.test.tsx` → "does NOT forward native props to the wrapper div"

These components destructure a fixed prop list and never spread a rest object, so
`id`, `aria-*`, `data-*` and event handlers do not reach the DOM.

```tsx
<FormControl id="fc-root" data-testid="fc" aria-label="Amount group">
  …
</FormControl>
```

Observed: none of the three attributes appear on the rendered wrapper.

This is a **discrepancy** rather than a bug in isolation — the props are not
declared, so TypeScript rejects them. It is recorded because sibling components
in the same slice (`Hint`, `Buttons`, `Chips`, `OptionCards`, `RadioGroup`,
`Label`, `IconButton`, every `Select*` part) **do** forward native props, so the
package is internally inconsistent and consumers cannot label or test the closed
ones without a wrapper element. See the matrix's
[prop-forwarding summary](./behavior-matrix.md#prop-forwarding-summary).

---

<a id="cb-1"></a>

## CB-1 — CheckBoxItem nests a `<label>` inside a `<label>` · low

**Source:** `packages/react-ui/src/components/CheckBoxItem/CheckBoxItem.tsx:23` and `:53`
**Test:** `tests/CheckBox.baseline.test.tsx` → "nests a `<label>` inside a `<label>`, both pointing at the same control"

```tsx
<label htmlFor={id} className="openui-checkbox-item-container">   {/* :23 */}
  <Checkbox.Root … id={id}>…</Checkbox.Root>
  <div className="openui-checkbox-item-content">
    <label htmlFor={id} className="openui-checkbox-item-label">   {/* :53 */}
```

Nested `<label>` elements are invalid HTML, and here both carry the same `for`.
Observed in jsdom: a single activation per click (the outer label makes the whole
row — description included — a click target).

**Narrowed by #23:** verified in real Chrome, activation is **single** for the
inner label, the description and the control alike — no double-toggle. A
framework-independent check also confirmed programmatic `.click()` is unaffected
by the nesting. So this is a **spec violation with no reproduced behavioral
consequence**: severity lowered from medium to low, and gap G-3 is closed. See
[the ledger](./verification-ledger.md#g-3).

`RadioItem` has the identical shape — see [R-1](#r-1). `SwitchItem` does not, and
that asymmetry is [S-1](#s-1).

---

<a id="r-1"></a>

## R-1 — RadioItem nests a `<label>` inside a `<label>` · low

**Source:** `packages/react-ui/src/components/RadioItem/RadioItem.tsx:19` and `:55`
**Test:** `tests/Radio.baseline.test.tsx` → "nests a `<label>` inside a `<label>`, both targeting the same id"

Identical to [CB-1](#cb-1): a container `<label htmlFor={id}>` wrapping a second
`<label htmlFor={id}>` for the label text.

---

<a id="c-3"></a>

## C-3 — Chips use listbox roles without listbox keyboard semantics · medium

**Source:** `packages/react-ui/src/components/Chips/Chips.tsx:42, 51-54`
**Tests:** `tests/Chips.baseline.test.tsx` → "makes every enabled chip its own tab stop", "has no arrow-key navigation and no aria-activedescendant"

The container is `role="listbox"` and each chip is `role="option"`, which tells
assistive technology to expect **one** tab stop plus arrow-key navigation and
`aria-activedescendant`. The chips are plain `<button>`s, so:

```tsx
<Chips
  items={[
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ]}
/>
// then: Tab, Tab, ArrowRight
```

Observed: Tab moves between every chip individually; `ArrowRight` does nothing;
the listbox has no `aria-activedescendant`. The ARIA contract and the real
keyboard behavior disagree.

---

<a id="oc-2"></a>

## OC-2 — OptionCards use radiogroup roles without radio keyboard semantics · medium

**Source:** `packages/react-ui/src/components/OptionCards/OptionCards.tsx:51, 81-85`
**Tests:** `tests/OptionCards.baseline.test.tsx` → "makes every enabled card its own tab stop (no roving focus)", "has no arrow-key selection"

Same shape as [C-3](#c-3): `role="radiogroup"` with `role="radio"`/`aria-checked`
children that are plain buttons. Tab visits every card and arrow keys do nothing,
where a radio group implies one tab stop and arrow-key selection.

---

<a id="cb-2"></a>

## CB-2 — `name`/`value` have no effect outside a `<form>` · medium

**Source:** Radix `Checkbox`/`Switch` bubble-input behavior, surfaced through `CheckBoxItem.tsx:20` (`...rest`) and `SwitchItem.tsx:31`
**Tests:** `tests/CheckBox.baseline.test.tsx` → "emits a hidden native input for name/value ONLY inside a `<form>`"; `tests/Switch.baseline.test.tsx` → "participates in a form only inside a `<form>`…"

```tsx
<CheckBoxItem label="Email digest" name="digest" value="email" defaultChecked />
```

Observed standalone: no hidden `<input>` exists, so `name`/`value` are accepted
by the type signature and then have no DOM effect whatsoever. Wrapped in a
`<form>`, the hidden input appears and `FormData` picks the value up correctly.

Expected Radix behavior, recorded because the props give no hint of the
requirement and a consumer reading `CheckBoxItemProps` would reasonably expect
`name`/`value` to be meaningful on their own.

---

<a id="ca-1"></a>

## CA-1 — A consumer `components` object silently replaces the caption dropdowns · medium

**Source:** `packages/react-ui/src/components/Calendar/Calendar.tsx:19-26, 32-33`
**Test:** `tests/Calendar.baseline.test.tsx` → "REPLACES the injected dropdown components if a consumer passes `components`"

`commonProps` (containing `components: { MonthsDropdown, YearsDropdown }`) is
spread **before** `{...props}`, so a consumer-supplied `components` object
replaces the entire map rather than merging per key.

```tsx
<Calendar mode="single" components={{ MonthsDropdown: MyMonths }} />
```

Observed: the custom `MonthsDropdown` renders, and the injected `YearsDropdown`
wrapper — which supplies the `container` needed for the caption's
container-aware sizing — is dropped with no warning. Overriding one DayPicker
component silently discards openui's other caption customizations.

---

<a id="sl-1"></a>

## SL-1 — `variant="discrete"` without `step` renders no dots · medium

**Source:** `packages/react-ui/src/components/Slider/Slider.tsx:103`
**Test:** `tests/Slider.baseline.test.tsx` → "renders NO dots for variant=discrete when step is omitted"

```ts
if (variant === "discrete" && step) { … }
```

`step` is optional in `SliderProps` (`:28`) while `variant` is required (`:25`),
so `variant="discrete"` alone is a valid, type-checked call that silently renders
a slider indistinguishable from a continuous one.

```tsx
<Slider variant="discrete" min={0} max={1000} defaultValue={[200]} />
```

Observed: zero `.openui-slider-dots-dot` elements.

---

<a id="t-1"></a>

## T-1 — ToggleGroup and ToggleItem are not exported from the package root · medium

**Source:** `packages/react-ui/src/index.ts` (no Toggle entry) vs `packages/react-ui/src/components/index.scss:75-76`
**Test:** `tests/Toggle.baseline.test.tsx` → "is NOT re-exported from the package root barrel"

Every other in-scope family is re-exported from `src/index.ts`; `ToggleGroup` and
`ToggleItem` are not — although their stylesheets **are** forwarded by
`components/index.scss`, so the CSS ships either way.

```ts
import * as pkg from "@openuidev/react-ui";
pkg.ToggleGroup; // undefined
```

Observed: `undefined` for both, while `pkg.RadioGroup` and `pkg.SwitchItem`
resolve. Consumers can only reach them through the `"./*"` subpath export
(`@openuidev/react-ui/ToggleGroup`, `package.json:62-70`). The asserted test uses
the `RadioGroup`/`SwitchItem` exports as a control so the check cannot pass
vacuously.

---

<a id="dp-4"></a>

## DP-4 — DatePicker popup does not close after a date is chosen · low

**Source:** `.../DatePicker/helpers/components/FloatingDatePickerRenderer.tsx`, `.../DatePickerRenderer.tsx`
**Test:** `tests/DatePicker.baseline.test.tsx` → "stays OPEN after a single date is chosen"

Selecting a day in `mode="single"` leaves the popup open, and the popup contains
no apply/dismiss affordance, so the only ways out are a trigger click or an
outside click. Escape is not handled either (a consequence of [DP-1](#dp-1)).
Reasonable for `mode="range"`, where a second click is expected; recorded for
`single` because it differs from `Select`, which closes on choose.

---

<a id="s-1"></a>

## S-1 — SwitchItem's description is not a click target · low

**Source:** `SwitchItem.tsx:23` (`<div>` container) vs `CheckBoxItem.tsx:23` / `RadioItem.tsx:19` (`<label>` container)
**Test:** `tests/Switch.baseline.test.tsx` → "does NOT toggle when the DESCRIPTION text is clicked"

`CheckBoxItem` and `RadioItem` wrap the whole row in a `<label>`, so clicking the
description toggles the control. `SwitchItem` uses a `<div>`, so its description
is inert while its label still works through `htmlFor`.

Observed: clicking `.openui-switch-item-description` fires no `onChange`, where
the same click on a checkbox or radio row does. Three sibling components with the
same prop shape behave differently for the same gesture.

---

<a id="c-2"></a>

## C-2 — `Chips type="single"` does not enforce single selection · low

**Source:** `packages/react-ui/src/components/Chips/Chips.tsx:28, 43`
**Test:** `tests/Chips.baseline.test.tsx` → "does not enforce single-selection for type=single"

`type` drives `aria-multiselectable` only; it does not constrain `selected` or
transform `onToggle`.

```tsx
<Chips items={items} type="single" selected={["typescript", "rust"]} />
```

Observed: both options report `aria-selected="true"` while the listbox advertises
`aria-multiselectable="false"` — the ARIA state contradicts itself. Because
`onToggle` emits only the bare toggled value (identically for select and
deselect), enforcing single-select is entirely the consumer's job; see
`fixtures/LegacyConsumerApp.tsx`. `OptionCards` has the same shape.

---

<a id="oc-1"></a>

## OC-1 — OptionCards and Chips default `type` differently · low

**Source:** `Chips.tsx:28` (`"multiple"`) vs `OptionCards.tsx:35` (`"single"`)
**Test:** `tests/OptionCards.baseline.test.tsx` → "defaults to type=single → role=radiogroup with role=radio cards"

The two components share an otherwise identical prop surface (`items`,
`selected`, `type`, `disabled`, `onToggle`) but default `type` to opposite
values, and the default silently changes the rendered ARIA roles.

---

<a id="t-2"></a>

## T-2 — ToggleGroup/ToggleItem are not `forwardRef`; `ref` works only on React 19 · low

**Source:** `ToggleGroup/ToggleGroup.tsx:14`, `ToggleItem/ToggleItem.tsx:10`
**Test:** `tests/Toggle.baseline.test.tsx` → "is NOT forwardRef, so ref support depends on the React major version"

Both are plain function components, unlike every sibling family. Under **React
19** (what this harness installs) `ref` is an ordinary prop, so it travels through
`{...props}` into the Radix primitive and the ref **does** populate.

react-ui's peer range is `"^18.3.1 || ^19.0.0"` (`pnpm-workspace.yaml` catalog).
On React 18 `ref` is extracted before props and never reaches the spread, so both
refs would stay `null`. The defect is the version-dependence; the React 18 half
is unverified here — gap [G-2](./observed-baseline.md#g-2).

---

<a id="r-2"></a>

## R-2 — RadioItem `style` lands on the control, not the row · low

**Source:** `packages/react-ui/src/components/RadioItem/RadioItem.tsx:27`
**Test:** `tests/Radio.baseline.test.tsx` → "applies `style` to the radio control, NOT to the row container"

```tsx
<RadioItem value="standard" label="Standard" style={{ marginTop: "8px" }} />
```

Observed: the margin lands on the `role="radio"` element; the
`.openui-radio-item-container` row is untouched. `className` is also applied to
the control, so a consumer has no way to style the row. `CheckBoxItem` differs
again: its `style` reaches the Radix root via `...rest`, and its `className` also
targets the control.

---

<a id="l-1"></a>

## L-1 — `Label disabled` is presentation only · low

**Source:** `packages/react-ui/src/components/Label/Label.tsx:21`
**Tests:** `tests/Label.baseline.test.tsx` → "treats `disabled` as presentation only…", "still forwards htmlFor while disabled…"

`disabled` only adds `openui-label-disabled`. No `aria-disabled` is set (a
`<label>` has no native `disabled` attribute), and `htmlFor` still activates the
associated control.

```tsx
<Label disabled htmlFor="speed-input">Delivery speed</Label>
<input id="speed-input" />
// then: click the label
```

Observed: the input receives focus. A consumer reading `disabled` could
reasonably expect the label to stop acting as an activation target, or at least
to expose the state to assistive technology.

Related, same file: `required` renders a bare `*` span that is not `aria-hidden`,
so the accessible name becomes `"Email*"`.
