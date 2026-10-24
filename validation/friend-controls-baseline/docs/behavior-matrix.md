# Public behavior matrix — remaining form controls

Baseline commit: **`9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`**
All paths are relative to the repository root. Line numbers refer to that commit.

**Reading this table.** For each family: the exported parts, the real public props
with their defaults, the event payloads, and — kept explicitly separate — which
behavior comes from a **native DOM attribute** passing through versus **custom
component behavior** implemented in `packages/react-ui`.

Status column: `tested` = asserted in `../tests/`; `documented` = recorded here
but not asserted (non-interactive role, or no way to exercise it in this
harness); `gap` = applicable but unverified, listed in
[observed-baseline.md](./observed-baseline.md#coverage-gaps).

---

## Prop-forwarding summary

The single most consequential inconsistency across this slice. "Closed" means the
props interface declares a fixed set and the component never spreads a rest
object, so native/ARIA/`data-*` attributes are **silently dropped at runtime**.

| Family          | Props shape                                                 | Native props reach the DOM? | `ref`                                              | Status |
| --------------- | ----------------------------------------------------------- | --------------------------- | -------------------------------------------------- | ------ |
| `Buttons`       | `extends HTMLAttributes<HTMLDivElement>`                    | yes                         | `forwardRef` → div                                 | tested |
| `Calendar`      | `= ComponentProps<typeof DayPicker>`                        | via DayPicker               | `forwardRef` → container div                       | tested |
| `CheckBoxGroup` | **closed** (4 props)                                        | **no**                      | `forwardRef` → div                                 | tested |
| `CheckBoxItem`  | **closed** (10 props)                                       | **no**                      | `forwardRef` → button                              | tested |
| `Chips`         | `extends Omit<HTMLAttributes<HTMLDivElement>, "onToggle">`  | yes                         | `forwardRef` → div                                 | tested |
| `DatePicker`    | **closed** (9 props)                                        | **no**                      | **none**                                           | tested |
| `FormControl`   | **closed** (4 props)                                        | **no**                      | `forwardRef` → div                                 | tested |
| `Hint`          | `extends ComponentPropsWithoutRef<"div">`                   | yes                         | `forwardRef` → div                                 | tested |
| `IconButton`    | `extends ButtonHTMLAttributes`                              | yes                         | `forwardRef` → button/slot                         | tested |
| `Label`         | `extends ComponentPropsWithoutRef<Radix Label.Root>`        | yes                         | `forwardRef` → label                               | tested |
| `OptionCards`   | `extends Omit<HTMLAttributes<HTMLDivElement>, "onToggle">`  | yes                         | `forwardRef` → div                                 | tested |
| `RadioGroup`    | `extends Radix.RadioGroupProps`                             | yes                         | `forwardRef` → div                                 | tested |
| `RadioItem`     | **closed** (7 props)                                        | **no**                      | `forwardRef` → button                              | tested |
| `Select*`       | `extends ComponentPropsWithoutRef<Radix part>`              | yes                         | `forwardRef` on all parts                          | tested |
| `Slider`        | `extends Omit<Radix Root props, "value" \| "defaultValue">` | yes                         | `forwardRef` → Radix root                          | tested |
| `SwitchGroup`   | **closed** (4 props)                                        | **no**                      | `forwardRef` → div                                 | tested |
| `SwitchItem`    | **closed** (10 props)                                       | **no**                      | `forwardRef` → button                              | tested |
| `ToggleGroup`   | `= Radix single\|multiple props & {...}`                    | yes                         | **not `forwardRef`** (see [T-2](./defects.md#t-2)) | tested |
| `ToggleItem`    | `extends Radix ToggleGroupItemProps`                        | yes                         | **not `forwardRef`** (see [T-2](./defects.md#t-2)) | tested |

`displayName` is set on every family except `Calendar`, `Slider`, `ToggleGroup`,
`ToggleItem` and all eight `Select*` parts.

---

## Non-interactive families

Per issue #19 item 3, these are recorded by their association/layout role; no
interaction requirements are invented for them.

### Label — `src/components/Label/Label.tsx`

Exports: `Label`, `LabelProps`.
Renders `@radix-ui/react-label` `Root` → a native `<label>` (`Label.tsx:16`).

| Prop                                          | Type                     | Default      | Behavior                                                                                                                              | Native or custom | Status                          |
| --------------------------------------------- | ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------- |
| `children`                                    | `ReactNode`              | — (required) | label content                                                                                                                         | custom           | tested                          |
| `className`                                   | `string`                 | —            | merged after `openui-label` (`:18-24`)                                                                                                | custom           | tested                          |
| `style`                                       | `CSSProperties`          | —            | applied to the `<label>`                                                                                                              | native           | tested                          |
| `disabled`                                    | `boolean`                | `undefined`  | **class only** → `openui-label-disabled` (`:21`). No attribute, no ARIA, still clickable.                                             | custom           | tested, [L-1](./defects.md#l-1) |
| `required`                                    | `boolean`                | `undefined`  | appends `<span class="openui-label-required-asterisk">*</span>` (`:29`), not `aria-hidden`, so the accessible name becomes `"Email*"` | custom           | tested                          |
| `htmlFor`, `id`, `aria-*`, `data-*`, handlers | Radix `Label.Root` props | —            | spread at `:26`; `htmlFor` gives native label→control activation                                                                      | **native**       | tested                          |

Association role: `Label` creates **no** automatic association. `htmlFor` must be
supplied by the consumer; `FormControl` does not inject it.

### FormControl + Hint — `src/components/FormControl/`

Exports: `FormControl`, `FormControlProps` (`FormControl.tsx`), `Hint`, `HintProps`
(`Hint/Hint.tsx`). `useFormControlContext` / `FormControlProvider` /
`FormControlContextValue` exist in `context.tsx` but are **not** re-exported by
`FormControl/index.ts` (which forwards only `./FormControl` and `./Hint`).

`FormControl` renders `<div class="openui-form-control">` (`FormControl.tsx:15`)
and publishes `{ hasError }` on context (`:13,16`).

| Prop          | Type            | Default         | Behavior                                                     | Native or custom | Status                            |
| ------------- | --------------- | --------------- | ------------------------------------------------------------ | ---------------- | --------------------------------- |
| `children`    | `ReactNode`     | — (required)    | rendered in order, untouched                                 | custom           | tested                            |
| `className`   | `string`        | —               | merged after `openui-form-control`                           | custom           | tested                            |
| `style`       | `CSSProperties` | —               | applied to the wrapper                                       | native           | tested                            |
| `hasError`    | `boolean`       | `false` (`:12`) | **context only** — no attribute or ARIA lands on the wrapper | custom           | tested                            |
| anything else | —               | —               | **dropped** — no rest spread                                 | n/a              | tested, [FC-1](./defects.md#fc-1) |

Layout role: a flex/stack wrapper. It does **not** generate ids, does not wire
`aria-describedby`, and does not associate a `Label` with a control.

`Hint` renders `<div class="openui-hint">` (`Hint.tsx:17`).

| Prop                 | Type                              | Default      | Behavior                                                                                                                         | Native or custom | Status |
| -------------------- | --------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------ |
| `children`           | `ReactNode`                       | — (required) | hint text                                                                                                                        | custom           | tested |
| `hasError`           | `boolean`                         | `undefined`  | `hasError ?? ctx?.hasError ?? false` (`:15`) → adds `openui-hint-error`. An explicit value wins over context in both directions. | custom           | tested |
| `className`, `style` | —                                 | —            | merged / applied                                                                                                                 | custom / native  | tested |
| native `div` props   | `ComponentPropsWithoutRef<"div">` | —            | spread at `:23`                                                                                                                  | **native**       | tested |

### Buttons — `src/components/Buttons/Buttons.tsx`

Exports: `Buttons`, `ButtonsProps`. Renders a `<div>` (`:24`).

| Prop                 | Type                                                         | Default                | Behavior                              | Native or custom | Status |
| -------------------- | ------------------------------------------------------------ | ---------------------- | ------------------------------------- | ---------------- | ------ |
| `variant`            | `"vertical" \| "horizontal"`                                 | `"horizontal"` (`:22`) | `openui-buttons-{variant}` (`:16-19`) | custom           | tested |
| `children`           | `ReactElement<ButtonProps \| IconButtonProps>` (one or many) | — (required)           | rendered in order                     | custom           | tested |
| `className`, `style` | —                                                            | —                      | merged / applied                      | custom / native  | tested |
| native `div` props   | `HTMLAttributes<HTMLDivElement>`                             | —                      | spread at `:28`                       | **native**       | tested |

Layout role only: no `role`, no toolbar semantics, no roving focus, no child
coordination. The `children` type references `ButtonProps` but nothing is
enforced at runtime.

---

## Interactive families

### CheckBoxItem — `src/components/CheckBoxItem/CheckBoxItem.tsx`

Exports: `CheckBoxItem`, `CheckBoxItemProps`. Radix `Checkbox.Root` → `<button
role="checkbox">` (not an `<input>`).

| Prop                 | Type                         | Default     | Behavior                                                                            | Native or custom | Status                            |
| -------------------- | ---------------------------- | ----------- | ----------------------------------------------------------------------------------- | ---------------- | --------------------------------- |
| `label`              | `ReactNode`                  | `undefined` | `<label class="openui-checkbox-item-label">` (`:53`); node omitted when absent      | custom           | tested                            |
| `description`        | `ReactNode`                  | `undefined` | `<p class="openui-checkbox-item-description">` (`:57`)                              | custom           | tested                            |
| `checked`            | `boolean`                    | `undefined` | controlled state via `...rest` → Radix                                              | custom           | tested                            |
| `defaultChecked`     | `boolean`                    | `undefined` | initial uncontrolled state                                                          | custom           | tested                            |
| `disabled`           | `boolean`                    | `undefined` | → Radix `disabled` (`:30`); sets native `disabled` + `data-disabled`                | **native**       | tested                            |
| `required`           | `boolean`                    | `undefined` | → Radix `required` (`:31`); surfaces as `aria-required="true"`                      | **native**       | tested                            |
| `name`, `value`      | `string`                     | `undefined` | reach Radix via `...rest`; produce a hidden native input **only inside a `<form>`** | **native**       | tested, [CB-2](./defects.md#cb-2) |
| `onChange`           | `(checked: boolean) => void` | `undefined` | mapped to Radix `onCheckedChange` (`:27`)                                           | custom           | tested                            |
| `className`, `style` | —                            | —           | `className` → Radix root; `style` reaches the root via `...rest`                    | custom           | tested                            |

- **Payload:** plain `boolean`. Radix's `indeterminate` state is not reachable
  through this prop surface.
- **Keyboard:** Space toggles; **Enter does nothing** (Radix checkbox binds Space only).
- **Click target:** the whole row, label _and_ description, because the container
  is a `<label>` (`:23`).
- **DOM defect:** nested `<label>` elements (`:23` and `:53`) — [CB-1](./defects.md#cb-1).

### CheckBoxGroup — `src/components/CheckBoxGroup/CheckBoxGroup.tsx`

Exports: `CheckBoxGroup`, `CheckBoxGroupProps`. Renders a `<div>` (`:23`).

| Prop                 | Type                                            | Default           | Behavior                                     | Status |
| -------------------- | ----------------------------------------------- | ----------------- | -------------------------------------------- | ------ |
| `children`           | `ReactElement<CheckBoxItemProps>` (one or many) | — (required)      | rendered in order                            | tested |
| `variant`            | `"clear" \| "card" \| "sunk"`                   | `"clear"` (`:21`) | `openui-checkbox-group-{variant}` (`:14-18`) | tested |
| `className`, `style` | —                                               | —                 | merged / applied                             | tested |

**Presentational only**: no `role`, no value management, no context, no child
coordination. Each item owns its own state. Contrast `RadioGroup` and
`ToggleGroup`, which _are_ value-managing.

### RadioGroup — `src/components/RadioGroup/RadioGroup.tsx`

Exports: `RadioGroup`, `RadioGroupProps`. Radix `Radio.Root` → `role="radiogroup"`.

| Prop                                                                 | Type                                         | Default           | Behavior                                  | Native or custom | Status        |
| -------------------------------------------------------------------- | -------------------------------------------- | ----------------- | ----------------------------------------- | ---------------- | ------------- |
| `variant`                                                            | `"clear" \| "card" \| "sunk"`                | `"clear"` (`:21`) | `openui-radio-group-{variant}` (`:14-18`) | custom           | tested        |
| `children`                                                           | `ReactElement<RadioItemProps>` (one or many) | — (required)      | rendered in order                         | custom           | tested        |
| `value` / `defaultValue`                                             | `string`                                     | `undefined`       | controlled / uncontrolled selection       | custom (Radix)   | tested        |
| `onValueChange`                                                      | `(value: string) => void`                    | `undefined`       | **Radix's name — not `onChange`**         | custom (Radix)   | tested        |
| `disabled`                                                           | `boolean`                                    | `undefined`       | disables every item                       | **native**       | tested        |
| `name`, `required`, `orientation`, `dir`, `loop`, `aria-*`, `data-*` | Radix `RadioGroupProps`                      | —                 | spread at `:27`                           | **native**/Radix | partly tested |

- **Payload:** the selected item's `value` string.
- **Focus:** roving tabindex — one tab stop; the initial stop is the checked item.
- **Keyboard:** Space selects the focused item. **Arrow keys move focus but do
  not select under jsdom** — raw Radix behaves identically, so this is a harness
  limitation, recorded as gap [G-1](./observed-baseline.md#g-1).

### RadioItem — `src/components/RadioItem/RadioItem.tsx`

Exports: `RadioItem`, `RadioItemProps`. Radix `Radio.Item` → `<button role="radio">`.

| Prop                   | Type            | Default          | Behavior                                        | Native or custom | Status                          |
| ---------------------- | --------------- | ---------------- | ----------------------------------------------- | ---------------- | ------------------------------- |
| `value`                | `string`        | — (**required**) | the value reported to the group                 | custom           | tested                          |
| `label`, `description` | `ReactNode`     | `undefined`      | `<label>` (`:55`) / `<p>` (`:59`)               | custom           | tested                          |
| `disabled`             | `boolean`       | `undefined`      | native `disabled`; skipped by Tab               | **native**       | tested                          |
| `required`             | `boolean`       | `undefined`      | → Radix `required` (`:26`)                      | **native**       | documented                      |
| `className`            | `string`        | —                | merged onto the radio control                   | custom           | tested                          |
| `style`                | `CSSProperties` | —                | applied to the **control**, not the row (`:27`) | native           | tested, [R-2](./defects.md#r-2) |
| `name`                 | —               | —                | **not accepted** — no rest spread               | n/a              | documented                      |

- **Click target:** the whole row including the description (container `<label>` at `:19`).
- **DOM defect:** nested `<label>` (`:19` and `:55`) — [R-1](./defects.md#r-1).

### SwitchItem — `src/components/SwitchItem/SwitchItem.tsx`

Exports: `SwitchItem`, `SwitchItemProps`. Radix `Switch.Root` → `<button role="switch">`.

Props are identical in shape to `CheckBoxItem` (`label`, `description`,
`className`, `style`, `checked`, `defaultChecked`, `disabled`, `required`,
`name`, `value`, `onChange: (value: boolean) => void`), with these differences:

| Difference        | Detail                                                                    | Status                          |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------- |
| Container element | `<div class="openui-switch-item-container">` (`:23`), **not** a `<label>` | tested                          |
| Click target      | label text only — the **description is inert**                            | tested, [S-1](./defects.md#s-1) |
| Keyboard          | Space **and Enter** both toggle (vs CheckBoxItem, where Enter is inert)   | tested                          |
| Extra DOM         | `<Switch.Thumb class="openui-switch-item-thumb">` (`:33`)                 | tested                          |
| Nested labels     | none — a single `<label htmlFor>` at `:37`                                | tested                          |

Form participation matches [CB-2](./defects.md#cb-2): a hidden native input
appears only inside a `<form>`.

### SwitchGroup — `src/components/SwitchGroup/SwitchGroup.tsx`

Exports: `SwitchGroup`, `SwitchGroupProps`. Same presentational-only contract and
same `variant` map as `CheckBoxGroup` (`:13-17`, default `"clear"` at `:20`). No
`role`, no value management. Status: tested.

### ToggleGroup / ToggleItem — `src/components/ToggleGroup/`, `src/components/ToggleItem/`

Exports: `ToggleGroup`, `ToggleGroupProps`; `ToggleItem`, `ToggleItemProps`.
**Neither is re-exported from `src/index.ts`** — [T-1](./defects.md#t-1).

| Prop                                                       | Type                                                    | Default                             | Behavior                                                                          | Status     |
| ---------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| `type`                                                     | `"single" \| "multiple"`                                | — (**required** by the Radix union) | `single` → `role="radio"` children; `multiple` → `role="button"` + `aria-pressed` | tested     |
| `value` / `defaultValue`                                   | `string` (single) / `string[]` (multiple)               | `undefined`                         | controlled / uncontrolled                                                         | tested     |
| `onValueChange`                                            | `(value: string) => void` / `(value: string[]) => void` | `undefined`                         | single emits `""` when cleared; multiple emits the full array                     | tested     |
| `disabled`                                                 | `boolean`                                               | `undefined`                         | group-wide or per item                                                            | tested     |
| `className`                                                | `string`                                                | —                                   | merged onto group / item                                                          | tested     |
| Radix extras (`orientation`, `dir`, `loop`, `rovingFocus`) | —                                                       | Radix defaults                      | spread at `ToggleGroup.tsx:16` / `ToggleItem.tsx:12`                              | documented |
| `ToggleItem.value`                                         | `string`                                                | — (required)                        | the item's value                                                                  | tested     |
| `ToggleItem.children`                                      | `ReactNode`                                             | — (required)                        | item content                                                                      | tested     |

- **Focus/keyboard:** single tab stop with arrow-key focus movement; Enter activates.
- **`ref`:** not declared, but reaches the Radix primitive under React 19 because
  `ref` is an ordinary prop there. Version-dependent — [T-2](./defects.md#t-2),
  gap [G-2](./observed-baseline.md#g-2).

### Chips — `src/components/Chips/Chips.tsx`

Exports: `Chips`, `ChipsProps`, `ChipsItem`, `ChipsSelectionType`.
Renders `<div role="listbox">` (`:42`) with `<button type="button" role="option">`
children (`:51-54`).

| Prop                 | Type                                               | Default                  | Behavior                                                                     | Native or custom | Status                          |
| -------------------- | -------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------- | ---------------- | ------------------------------- |
| `items`              | `ChipsItem[]`                                      | — (required)             | items with a falsy `value` are dropped (`:36`); a missing array is tolerated | custom           | tested                          |
| `selected`           | `string[]`                                         | `[]` (`:27`)             | **fully controlled** — no internal state, no uncontrolled mode               | custom           | tested                          |
| `type`               | `"single" \| "multiple"`                           | **`"multiple"`** (`:28`) | drives `aria-multiselectable` **only**; selection count is not enforced      | custom           | tested, [C-2](./defects.md#c-2) |
| `disabled`           | `boolean`                                          | `false` (`:29`)          | disables every chip                                                          | **native**       | tested                          |
| `onToggle`           | `(value: string) => void`                          | `undefined`              | emits only the toggled value, identically for select and deselect            | custom           | tested                          |
| `className`          | `string`                                           | —                        | merged after `openui-chips`                                                  | custom           | tested                          |
| native `div` props   | `Omit<HTMLAttributes<HTMLDivElement>, "onToggle">` | —                        | spread at `:44`                                                              | **native**       | tested                          |
| `ChipsItem.icon`     | `ReactNode`                                        | `undefined`              | `<span class="openui-chip-item__icon">` (`:64`)                              | custom           | tested                          |
| `ChipsItem.disabled` | `boolean`                                          | `undefined`              | per-chip native `disabled` (`:48`)                                           | **native**       | tested                          |

- **Focus/keyboard:** every enabled chip is its own tab stop; no arrow-key
  navigation and no `aria-activedescendant`, despite the listbox role —
  [C-3](./defects.md#c-3). Enter and Space both activate (native button).

### OptionCards — `src/components/OptionCards/OptionCards.tsx`

Exports: `OptionCards`, `OptionCardsProps`, `OptionCardsItem`,
`OptionCardsSelectionType`. Same controlled shape as `Chips`, with:

| Prop                                                              | Type                     | Default                                       | Behavior                                                                                                        | Status                            |
| ----------------------------------------------------------------- | ------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `type`                                                            | `"single" \| "multiple"` | **`"single"`** (`:35`) — differs from `Chips` | `single` → `role="radiogroup"` + `role="radio"`/`aria-checked`; `multiple` → `role="group"` + `role="checkbox"` | tested, [OC-1](./defects.md#oc-1) |
| `items`                                                           | `OptionCardsItem[]`      | — (required)                                  | falsy `value` dropped (`:43`); packed into rows of up to 3 via `getRowConfiguration` (`:44`)                    | tested                            |
| `selected`, `disabled`, `onToggle`, `className`, native div props | as `Chips`               | as `Chips`                                    | as `Chips`                                                                                                      | tested                            |
| `OptionCardsItem.title`                                           | `string`                 | — (required)                                  | rendered through `InlineMarkdownRenderer` (`:106`) — **not literal text**                                       | tested                            |
| `OptionCardsItem.subtitle`                                        | `string`                 | `undefined`                                   | also inline markdown (`:110`)                                                                                   | tested                            |
| `OptionCardsItem.topContent`                                      | `ReactNode`              | `undefined`                                   | top slot (`:94-103`)                                                                                            | tested                            |
| `OptionCardsItem.topContentVariant`                               | `"icon" \| "image"`      | `"icon"` (`:77`)                              | `openui-option-card__top--{variant}`                                                                            | tested                            |
| `OptionCardsItem.disabled`                                        | `boolean`                | `undefined`                                   | per-card native `disabled`                                                                                      | tested                            |

- Grid marks `openui-option-cards__grid--odd-count` for odd item counts (`:58`).
- **Focus/keyboard:** same as `Chips` — one tab stop per card, no arrow-key
  selection despite the radiogroup role — [OC-2](./defects.md#oc-2).

### IconButton — `src/components/IconButton/IconButton.tsx`

Exports: `IconButton`, `IconButtonProps`. Renders `<button>`, or the slotted child
when `asChild` (`:68`).

| Prop                                      | Type                                                                                    | Default             | Behavior                                                                                       | Native or custom | Status                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------- | ---------------- | --------------------------------- |
| `icon`                                    | `ReactNode`                                                                             | — (required)        | `<span class="openui-icon-button-icon">` after children (`:83`); a falsy value renders no slot | custom           | tested                            |
| `variant`                                 | `"primary" \| "secondary" \| "tertiary"`                                                | `"primary"` (`:56`) | `:26-36`                                                                                       | custom           | tested                            |
| `size`                                    | `"3-extra-small" \| "2-extra-small" \| "extra-small" \| "small" \| "medium" \| "large"` | `"medium"` (`:57`)  | `:38-45`                                                                                       | custom           | tested                            |
| `shape`                                   | `"square" \| "circle"`                                                                  | `"square"` (`:58`)  | `:47-50`                                                                                       | custom           | tested                            |
| `appearance`                              | `"normal" \| "destructive"`                                                             | `"normal"` (`:59`)  | selects the variant map (`:65-66`)                                                             | custom           | tested                            |
| `asChild`                                 | `boolean`                                                                               | `false` (`:60`)     | renders Radix `Slot` instead of `<button>`; classes and handlers merge onto the child          | custom           | tested                            |
| `children`                                | `ReactNode`                                                                             | `undefined`         | wrapped in `Slottable` (`:82`), rendered **before** the icon                                   | custom           | tested                            |
| `type`                                    | `"button" \| "submit" \| "reset"`                                                       | **not defaulted**   | native default `"submit"` applies → submits inside a `<form>`                                  | **native**       | tested, [IB-1](./defects.md#ib-1) |
| `disabled`, `onClick`, `aria-*`, `data-*` | `ButtonHTMLAttributes`                                                                  | —                   | spread at `:80`                                                                                | **native**       | tested                            |

Accessible name: none is derived. An icon-only button has no name unless the
consumer supplies `aria-label`.

### Slider — `src/components/Slider/Slider.tsx`

Exports (from `Slider/index.ts`): `Slider`, `SliderProps`, plus `SliderBlock`,
`SliderBlockProps` from `./SliderBlock`.

| Prop                           | Type                         | Default                    | Behavior                                                                                                                            | Native or custom    | Status                            |
| ------------------------------ | ---------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------- |
| `variant`                      | `"continuous" \| "discrete"` | — (**required**)           | `discrete` + `step` renders dots (`:102-126`); also used as `key` on the Radix root (`:153`), so changing it remounts the primitive | custom              | tested                            |
| `min`                          | `number`                     | — (**required**)           | ARIA min + left label                                                                                                               | custom              | tested                            |
| `max`                          | `number`                     | — (**required**)           | ARIA max + right label                                                                                                              | custom              | tested                            |
| `step`                         | `number`                     | `undefined`                | keyboard increment; **gates the discrete dots**                                                                                     | custom              | tested, [SL-1](./defects.md#sl-1) |
| `value`                        | `number[]`                   | `undefined`                | controlled; presence alone switches modes (`:62`)                                                                                   | custom              | tested                            |
| `defaultValue`                 | `number[]`                   | `[min]` (`:58-60`)         | initial uncontrolled value; later changes ignored                                                                                   | custom              | tested                            |
| `onValueChange`                | `(value: number[]) => void`  | `undefined`                | fires in both modes; internal state advances only when uncontrolled (`:145-150`)                                                    | custom (Radix)      | tested                            |
| `disabled`                     | `boolean`                    | `undefined`                | adds `openui-slider--disabled` (`:137`) and **hides the value indicator** (`:80,94`)                                                | **native** + custom | tested                            |
| `leftContent` / `rightContent` | `ReactNode`                  | `undefined`                | slots outside the track (`:130,172`)                                                                                                | custom              | tested                            |
| `className`                    | `string`                     | —                          | merged onto the Radix root                                                                                                          | custom              | tested                            |
| `style`                        | `CSSProperties`              | —                          | applied to the Radix root (`:154`), not the wrapper                                                                                 | native              | documented                        |
| other Radix `Root` props       | —                            | —                          | spread at `:140`, **before** `min`/`max`/`step`/`value`/`onValueChange`, so those cannot be overridden                              | Radix               | documented                        |
| `minStepsBetweenThumbs`        | —                            | **hardcoded `1`** (`:151`) | not overridable                                                                                                                     | Radix               | tested                            |

- **Multi-thumb:** passing 2+ values renders one thumb each; `openui-slider-range--at-min` is suppressed in range mode (`:159`).
- **Number formatting:** `formatNumber` (`:5-19`) uses `Intl.NumberFormat("en-US", {notation:"compact"})` lowercased for values ≥ 1000 — `1000` → `"1k"`, `1500` → `"1.5k"`; below 1000 it is `String(num)`. The `"en-US"` locale is hardcoded.
- **Keyboard:** Arrow keys step, Home/End jump to the bounds, clamped at `min`/`max`.
- **`SliderBlock`** (`SliderBlock.tsx`) composes `Input` and `Select` and adds
  `label: string` (required) and `isStreaming?: boolean`. `Input` is owned by
  issue #9, so `SliderBlock` is documented here and deliberately **not** given a
  test suite — see [observed-baseline.md](./observed-baseline.md#sliderblock).

### Select — `src/components/Select/Select.tsx`

Exports: `Select`/`SelectProps`, `SelectGroup`/`SelectGroupProps`, `SelectValue`
(a bare re-export of Radix `Value`, `:60`), `SelectTrigger`/`SelectTriggerProps`,
`SelectContent`/`SelectContentProps`, `SelectLabel`/`SelectLabelProps`,
`SelectItem`/`SelectItemProps`, `SelectSeparator`/`SelectSeparatorProps`.

`SelectSizeContext` and `useSelectSizeContext` are internal (`:14-16`).

| Part / prop                                     | Type                                                                                                                                                    | Default                      | Behavior                                                                               | Native or custom | Status                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------- | ---------------- | --------------------------------- |
| `Select.size`                                   | `"sm" \| "md" \| "lg"`                                                                                                                                  | `"md"` (`:22`)               | seeds the size context; re-synced by an effect on change (`:25-27`)                    | custom           | tested                            |
| `Select` others                                 | `ComponentPropsWithoutRef<Radix Select.Root>` — `value`, `defaultValue`, `onValueChange`, `open`, `onOpenChange`, `disabled`, `name`, `required`, `dir` | Radix defaults               | spread at `:36`                                                                        | Radix            | partly tested                     |
| `SelectTrigger.hideDropdownIcon`                | `boolean`                                                                                                                                               | `undefined`                  | **throws when `true`**                                                                 | custom           | tested, [SE-1](./defects.md#se-1) |
| `SelectTrigger.size`                            | `"sm" \| "md" \| "lg"`                                                                                                                                  | context, else `"md"` (`:83`) | sets its own class and writes back into context (`:85-89`)                             | custom           | tested, [SE-3](./defects.md#se-3) |
| `SelectTrigger` others                          | Radix `Trigger` props                                                                                                                                   | —                            | spread at `:96`; renders `<button type="button" role="combobox">`                      | **native**/Radix | tested                            |
| `SelectContent.position`                        | `"item-aligned" \| "popper"`                                                                                                                            | `"popper"` (`:118`)          | sets Radix `position` and the viewport's `data-position` (`:136`)                      | custom           | tested                            |
| `SelectContent` others                          | Radix `Content` props                                                                                                                                   | `sideOffset={2}` (`:133`)    | **portals to `document.body`** (`:123`); adds `portalThemeClassName` from `useTheme()` | Radix            | tested                            |
| `SelectItem.showTick`                           | `boolean`                                                                                                                                               | `true` (`:176`)              | toggles the check wrapper and the `--with-tick`/`--without-tick` class                 | custom           | tested                            |
| `SelectItem.textValue`                          | `string`                                                                                                                                                | `undefined`                  | **rendered as extra visible text** (`:197`) and **not** forwarded to Radix             | custom           | tested, [SE-2](./defects.md#se-2) |
| `SelectItem` others                             | Radix `Item` props — `value` (required), `disabled`                                                                                                     | —                            | spread at `:185`                                                                       | **native**/Radix | tested                            |
| `SelectGroup`, `SelectLabel`, `SelectSeparator` | Radix part props                                                                                                                                        | —                            | class + `style` wrappers only                                                          | Radix            | tested                            |

- **Payload:** `onValueChange(value: string)` — the item's `value`, not its label.
  The trigger displays the chosen item's label.
- **Portal behavior:** content mounts under `document.body` and unmounts on close;
  Radix sets `aria-hidden="true"` on everything outside the open popup.
- **Keyboard:** Enter opens; Arrow keys move the active option; Enter selects;
  Escape closes and returns focus to the trigger.

### Calendar — `src/components/Calendar/Calendar.tsx`

Exports: `Calendar`, `CalendarProps`.
`CalendarProps = React.ComponentProps<typeof DayPicker>` (`:8`) — the entire
public prop surface is **react-day-picker 9.14.0's**, so only what openui adds or
overrides is listed.

| Aspect                   | Detail                                                                                                                                                         | Status                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Container                | `<div class="openui-calendar-container">`, consumer `className` merged (`:30`)                                                                                 | tested                            |
| `captionLayout`          | injected as `"dropdown"` (`:18`), **overridable** because `commonProps` is spread before `{...props}` (`:32-33`)                                               | tested                            |
| `components`             | injects `MonthsDropdown`/`YearsDropdown` built on the **openui `Select`** (`:19-26`) — the caption is `role="combobox"`, not native `<select>`                 | tested                            |
| `components` override    | a consumer `components` object **replaces the whole map**, dropping the injected dropdowns                                                                     | tested, [CA-1](./defects.md#ca-1) |
| `classNames`             | mode-derived defaults (`DateSingleClasses` for `single`/`multiple`, `DateRangeClasses` otherwise) then consumer entries merged per key (`:34-39`)              | tested                            |
| `layout` context         | read from `useLayoutContext()` (`:12`), default `"fullscreen"`; selects the class set                                                                          | documented                        |
| `ref`                    | merged with an internal container ref via `useMultipleRefs` (`:15`)                                                                                            | documented                        |
| `selected` (update path) | **not re-read on re-render**; correct on a fresh mount. Raw DayPicker behaves identically.                                                                     | tested, [CA-2](./defects.md#ca-2) |
| `onSelect` payload       | DayPicker's `(date, triggerDate, modifiers, event)`; `single` mode reports `undefined` when the selected day is re-clicked; `range` mode reports a `DateRange` | tested                            |
| Focus/keyboard           | tab order is previous-month, next-month, then a single grid tab stop; arrows move by day/week; Enter selects                                                   | tested                            |
| `disabled` matchers      | DayPicker matchers disable the day buttons and suppress `onSelect`                                                                                             | tested                            |

### DatePicker — `src/components/DatePicker/DatePicker.tsx`

Exports: `DatePicker`, `DatePickerProps`. Not `forwardRef`; no `displayName`.
Internals (`DatePickerProvider`, `FloatingDatePickerRenderer`, `DatepickerRenderer`,
`formatSingleDate`, `formatDateRange`) are **not** part of the public surface.

| Prop                    | Type                          | Default                                | Behavior                                                  | Status |
| ----------------------- | ----------------------------- | -------------------------------------- | --------------------------------------------------------- | ------ |
| `mode`                  | `"single" \| "range"`         | `"single"` (`:23`)                     | chooses the renderer and the trigger's format/placeholder | tested |
| `selectedSingleDate`    | `Date`                        | `undefined`                            | displayed value, preferred over internal state (`:73`)    | tested |
| `setSelectedSingleDate` | `(date?: Date) => void`       | `undefined`                            | called on every selection (`:49-57`)                      | tested |
| `selectedRangeDates`    | `DateRange`                   | `undefined`                            | as above for range (`:74`)                                | tested |
| `setSelectedRangeDates` | `(range?: DateRange) => void` | `undefined`                            | as above (`:59-67`)                                       | tested |
| `isOpen`                | `boolean`                     | `undefined` → internal `false` (`:40`) | popup open state, preferred over internal (`:77`)         | tested |
| `setIsOpen`             | `(isOpen: boolean) => void`   | `undefined`                            | falls back to the internal setter (`:78`)                 | tested |
| `className`, `style`    | —                             | —                                      | applied to the outer container                            | tested |

- **Trigger:** a `<div onClick>` (`FloatingDatePickerRenderer.tsx:20-31`) with no
  `role`, `tabIndex`, `aria-expanded` or `aria-haspopup` — **keyboard
  unreachable** ([DP-1](./defects.md#dp-1)).
- **Display format:** `format(date, "MMM d, yyyy")` via date-fns
  (`helperFn.tsx:84-87`); placeholders `"Select a date"` / `"Select a range"`;
  a half-open or same-day range collapses to one date (`:73-79`).
- **Popup:** portals to `document.body` (`FloatingDatePickerRenderer.tsx:71-82`),
  positioned with `@floating-ui/react-dom`. Closes on outside `mousedown`/
  `touchstart` (`:98-116`) or a trigger click. **Escape does not close it.**
  It also **stays open after a date is chosen** ([DP-4](./defects.md#dp-4)).
- **Calendar bounds:** the inner `Calendar` is pinned to
  `startMonth={new Date(1900, 0)}` / `endMonth={new Date(2100, 11)}`
  (`DatePickerRenderer.tsx:23-24,40-41`) and receives no `month`, so it opens on
  the current month.
- **State defects:** a controlled value cannot be cleared once a date has been
  picked ([DP-2](./defects.md#dp-2)); `isOpen` without `setIsOpen` is stuck
  ([DP-3](./defects.md#dp-3)).
