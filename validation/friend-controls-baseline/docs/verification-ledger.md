# Verification ledger — issue #23

Baseline commit: **`9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`** (unchanged)
Browser: **Chrome/156.0.8078.47**, headless, CDP protocol 1.3
Raw results: [browser-results.json](./browser-results.json) · 61 checks, 10/10 scenarios, 0 failures

This ledger re-examines what #19 reported, using a real browser engine. It exists
because #19's conclusions came from jsdom plus one test-authoring mistake, and
issue #23 requires each item to be classified rather than inherited.

**Every classification below is the result of a run, not of reading source.**
Where a #19 claim did not survive verification, the correction is stated plainly
and the superseded claim is named.

## Classification key

| Class                         | Meaning                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| **confirmed baseline defect** | Reproduced in Chrome through the public API. Real, and not caused by the harness.                   |
| **supported API restriction** | Behaves as the API documents or implies. Not a defect; the earlier report was wrong or over-stated. |
| **harness artifact**          | Only observable because of how a test harness drove it. Says nothing about the component.           |
| **still unverified**          | Not settled by this work. Listed with what it would take.                                           |

---

## Summary

| ID                  | #19 said                                                      | #23 verdict                                                                                                                   | Class                                                                              |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [CA-2](#ca-2)       | Calendar ignores `selected` on re-render — **high**, upstream | **Wrong.** Controlled mode re-reads `selected` correctly. The old test omitted `onSelect` and so drove the uncontrolled path. | supported API restriction                                                          |
| [G-1](#g-1)         | Arrow-key selection unverifiable (jsdom gap)                  | **Works.** ArrowDown selects, and openui matches raw Radix exactly.                                                           | supported API restriction                                                          |
| [G-3](#g-3)         | Nested-label activation unverified                            | **Activates exactly once.** No double-toggle. Invalid HTML stands; no functional consequence found.                           | supported API restriction (nesting remains a defect, narrowed — see [CB-1](#cb-1)) |
| [G-4](#g-4)         | Slider drag unverified                                        | **Drag and track-click both work**, step-aligned.                                                                             | supported API restriction                                                          |
| [G-8](#g-8)         | Popup geometry unverified                                     | **Verified** for both Select and DatePicker, to the pixel.                                                                    | supported API restriction                                                          |
| [SE-1](#se-1)       | `hideDropdownIcon` throws — high                              | **Confirmed in Chrome.**                                                                                                      | confirmed baseline defect                                                          |
| [SE-2](#se-2)       | `textValue` renders as text and breaks typeahead              | **Half confirmed.** Duplication is real; typeahead still works.                                                               | confirmed baseline defect (narrowed)                                               |
| [DP-1](#dp-1)       | DatePicker trigger keyboard-unreachable — high                | **Confirmed in Chrome.**                                                                                                      | confirmed baseline defect                                                          |
| [DP-2](#dp-2)       | Controlled value cannot be cleared — high                     | **Confirmed in Chrome.**                                                                                                      | confirmed baseline defect                                                          |
| [DP-3](#dp-3)       | `isOpen` without `setIsOpen` is stuck — high                  | **Confirmed in Chrome**, and Escape does not help.                                                                            | confirmed baseline defect                                                          |
| [CB-1 / R-1](#cb-1) | Nested `<label>` — medium                                     | **Narrowed.** Invalid HTML, but no misbehavior in Chrome.                                                                     | confirmed baseline defect (spec violation only)                                    |
| [G-6](#g-6)         | Select typeahead unverified                                   | **Works**, matching rendered children.                                                                                        | supported API restriction                                                          |
| [G-7](#g-7)         | Calendar caption menus unverified                             | **Work**, including month navigation and `multiple` mode.                                                                     | supported API restriction                                                          |
| [G-2](#g-2)         | React 18 `ref` for Toggle*                                    | Unchanged — needs an install at the peer floor.                                                                               | still unverified                                                                   |
| [N-1](#n-1)         | _(new)_                                                       | Select shields the page with `pointer-events: none` while open.                                                               | supported API restriction                                                          |
| [N-2](#n-2)         | _(new)_                                                       | Arrow-key selection depends on key **dwell time**.                                                                            | harness artifact                                                                   |

Net effect on #19's five high-severity findings: **four stand** (SE-1, DP-1, DP-2, DP-3) and **one is withdrawn** (CA-2).

---

<a id="ca-2"></a>

## CA-2 — WITHDRAWN as a defect · supported API restriction

**#19 claimed:** "Calendar does not re-read `selected` on re-render", filed **high**
severity and attributed upstream to react-day-picker.

**That claim was wrong, and so was its evidence.** The test supplied `selected`
but no `onSelect`, and the raw-DayPicker control group shared the same omission —
so the control group could not catch the error, it only made a mistaken reading
look corroborated.

In react-day-picker 9.14.0 **`onSelect` is the controlled/uncontrolled switch.**
From `selection/useSingle.js:13-14` (identical in `useRange.js:15-16` and
`useMulti.js:13-14`):

```js
const [internallySelected, setSelected] = useControlledValue(
  initiallySelected,
  onSelect ? initiallySelected : undefined,
);
const selected = !onSelect ? internallySelected : initiallySelected;
```

- **With `onSelect`** → `selected` is read from the prop every render: controlled,
  and prop updates ARE reflected.
- **Without `onSelect`** → it comes from `useState(initiallySelected)`, captured
  once: uncontrolled, and later prop updates are correctly ignored.

So the behavior #19 reported is the documented uncontrolled contract.

Verified both ways, on the OpenUI Calendar and the pinned DayPicker, in
`tests/Calendar.baseline.test.tsx`:

| Test                                                          | Result                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------ |
| CONTROLLED (`selected` + `onSelect`), re-render to a new date | highlight moves to the new date ✓                      |
| CONTROLLED, raw DayPicker control group                       | identical ✓                                            |
| CONTROLLED, click a day                                       | reports via `onSelect`, DOM does not move on its own ✓ |
| UNCONTROLLED (`selected`, no `onSelect`), re-render           | ignores the new prop — by design ✓                     |
| UNCONTROLLED, raw DayPicker control group                     | identical ✓                                            |
| UNCONTROLLED, click a day                                     | internal selection advances ✓                          |

Minimal reproduction of the corrected behavior:

```tsx
const onSelect = () => {};
const { rerender } = render(
  <Calendar mode="single" month={MAR_2024} selected={mar14} onSelect={onSelect} />,
);
rerender(<Calendar mode="single" month={MAR_2024} selected={mar20} onSelect={onSelect} />);
// highlight is on 20 — controlled mode works
```

**Historical note, not evidence:** the original observation (no update without
`onSelect`) is reproducible and is kept as the uncontrolled test above. It is not
proof of a controlled bug and must not be cited as one.

**Lesson applied to the rest of this work:** a control group is only as good as
the inputs it shares. Both arms of a comparison must be checked against the
API's actual contract before the comparison means anything.

---

<a id="se-1"></a>

## SE-1 — confirmed baseline defect

`SelectTrigger hideDropdownIcon` throws in Chrome, exactly as it did in jsdom.

Scenario `select-hide-icon`:

```
✓ render throws with Radix's Slot message
    "Primitive.span failed to slot onto its children. Expected a single React element child or `Slottable`."
✓ no trigger renders at all
```

Cause unchanged (`Select.tsx:99-101`): with `hideDropdownIcon={true}` the
expression `{!hideDropdownIcon && <ChevronDown/>}` is `false`, and Radix's `Slot`
requires exactly one element child. A declared prop that cannot be used.

---

<a id="se-2"></a>

## SE-2 — confirmed baseline defect, consequence narrowed

The duplication is real; the typeahead consequence #19 implied is **not**.

Scenario `select-textvalue`:

```
✓ option text is duplicated (children + textValue)
    ["EuroEuro currency", "Pound sterlingPound currency"]
· typeahead 'p' lands on {"activeText":"Pound sterlingPound currency","role":"option"}
✓ typeahead still matches on the rendered children
```

`textValue` is destructured out of the props given to `SelectPrimitive.Item`
(`Select.tsx:176`) and rendered in its own span (`Select.tsx:197`), so every
option shows its text twice. Radix's real `textValue` is never set — but
typeahead still works, because Radix falls back to the rendered text content.

**Correction to #19:** the defect is the visible duplication and the prop-name
collision, not broken typeahead. Gap [G-6](#g-6) is closed.

---

<a id="dp-1"></a>

## DP-1 — confirmed baseline defect

The DatePicker trigger is unreachable by keyboard in a real browser.

Scenario `datepicker-geometry`:

```
✓ DP-1: Tab does NOT reach the DatePicker trigger
· DP-1: first Tab lands on {"tag":"BUTTON","id":"outside","isTrigger":false}
✓ Escape does NOT dismiss (no key handling)
```

The trigger is a `<div onClick>` with no `role`, `tabIndex`, `aria-expanded` or
`aria-haspopup` (`FloatingDatePickerRenderer.tsx:20-31`). Tab skips it entirely
and lands on the next real control. A keyboard-only user cannot open it.

---

<a id="dp-2"></a>

## DP-2 — confirmed baseline defect

Scenario `datepicker-clear`, driven entirely through the public API with real clicks:

```
✓ starts on the placeholder — "Select a date"
✓ picking a day updates the trigger — "Oct 14, 2026"
✓ consumer state really is cleared — null
✓ DP-2 confirmed: trigger still shows the old date after clearing
    controlledDate=null but trigger shows "Oct 14, 2026"
```

The consumer's own state is `null` and the picker still displays the old date.
Cause unchanged (`DatePicker.tsx:49-57`, `:73`): the handler guards on the
current value's truthiness rather than on whether the prop was provided, so it
seeds internal state even when controlled, and the render prefers
`selectedSingleDate ?? internalSelectedDate`.

---

<a id="dp-3"></a>

## DP-3 — confirmed baseline defect

Scenario `datepicker-stuck`:

```
✓ opens from isOpen={true}
✓ DP-3: a trigger click does not close it
✓ DP-3: an outside click does not close it either
✓ DP-3: Escape does not close it
```

With `isOpen` supplied and no `setIsOpen`, reads prefer the prop while writes go
to internal state (`DatePicker.tsx:77-78`), so the popup cannot be dismissed by
any means. Both props are independently optional, so the combination is
type-legal.

---

<a id="g-1"></a>

## G-1 — CLOSED · arrow-key selection works

#19 could only record a gap: under jsdom, arrow keys moved roving focus but
never selected, for openui **and** for raw Radix.

In Chrome both select, and they agree exactly. Scenario `radio-arrows`:

```
✓ openui: focus starts on first radio
✓ openui: ArrowDown moves focus to 2nd radio
✓ G-1 RESOLVED — openui: ArrowDown SELECTS the focused radio
    selected=["express"] onValueChange=["express"]
✓ radix control group: ArrowDown SELECTS too
    selected=["express"] onValueChange=["express"]
✓ openui matches raw Radix (wrapper adds no deviation)
```

Mechanism (`@radix-ui/react-radio-group` 1.4.7, `index.mjs:338-372`): a document
`keydown` listener records that an arrow key is down, and each item's `onFocus`
calls `ref.current?.click()` while that flag is set. See [N-2](#n-2) for the
harness subtlety this exposed.

---

<a id="g-3"></a>
<a id="cb-1"></a>

## G-3 — CLOSED · nested-label activation is single; CB-1/R-1 narrowed

#19 flagged that `CheckBoxItem` and `RadioItem` nest a `<label>` inside a
`<label>` with the same `for`, and recorded that real-browser activation was
unverified — browsers _might_ double-activate.

They do not. Scenario `nested-label`:

```
✓ checkbox: clicking the inner label fires onChange exactly once
✓ checkbox: ends up checked (no double-toggle)
✓ checkbox: clicking the description also toggles once
✓ checkbox: clicking the control toggles once
✓ radio: clicking the inner label fires onValueChange once
✓ radio: ends up checked
✓ nested <label> with identical `for` is present in the DOM
```

A separate framework-independent check confirmed that programmatic `.click()`
is **not** affected by the nesting either: a `<button>` inside
`<label for="itself">`, inside a bare `<label>`, inside `<label for="other">`,
and with no label at all all dispatch exactly one click.

**Correction to #19:** CB-1/R-1 remain real — nested `<label>` elements are
invalid HTML and a validator will reject them — but they are a **spec violation
with no reproduced behavioral consequence**, not a functional bug. Severity
should read low, not medium. Gap G-3 is closed.

---

<a id="g-4"></a>

## G-4 — CLOSED · slider drag and track click work

#19 could only test keyboard movement, because jsdom has no pointer capture
(the harness stubbed it just to let the component mount).

Scenario `slider`, with a real press-move-release:

```
✓ thumb has real layout geometry (non-zero size) — 20x20 at (145,64)
✓ dragging the thumb changes the value (real pointer capture) — from [200] to [800]
✓ dragged value lands on a step multiple of 100 — [800]
✓ clicking the track jumps the value — from [200] to [300] (clicked 30% of track)
```

Dragging to 80% of the track yields 800 and a 30% track click yields 300, both
snapped to `step`. No defect.

---

<a id="g-8"></a>

## G-8 — CLOSED · popup geometry verified to the pixel

jsdom has no layout, so #19 could only assert that position-related props
reached the DOM. Measured in Chrome:

**Select** (`sideOffset={2}`, `position="popper"`):

```
✓ popup is anchored below the trigger (sideOffset 2)
    trigger.bottom=105 popup.top=107 gap=2.0
✓ popup is horizontally aligned with the trigger — trigger.left=41 popup.left=42.6
✓ popup is inside the viewport — 136.8x101.6 within 1280x813
✓ choosing closes · outside click dismisses · Escape dismisses
✓ focus returns to the trigger after Escape
```

**DatePicker** (`@floating-ui` `offset(5)`, `bottom-start`):

```
✓ popup is placed below the trigger — trigger.bottom=111 popup.top=116 gap=5.0
✓ popup has non-zero size — 318x320
✓ popup is inside the viewport
✓ outside click dismisses
```

Both gaps measured exactly the configured offsets. No defect.

---

<a id="g-6"></a>

## G-6 — CLOSED

Select typeahead works; see [SE-2](#se-2).

<a id="g-7"></a>

## G-7 — CLOSED · Calendar caption menus and `multiple` mode

Scenario `calendar-caption`:

```
✓ caption renders two openui Select comboboxes, not native <select>
✓ no native <select> in the caption
· caption combobox labels ["March","2024"]
✓ month menu opens with month options — 12 options
✓ month menu has real geometry inside the viewport
✓ choosing a month updates the caption — "May"
✓ multiple mode accumulates two selected dates
✓ both days are marked selected in the DOM
```

The caption is built from openui `Select`s rather than native `<select>`
elements, and they navigate correctly. `multiple` mode accumulates selections.
No defect.

**Fixture note worth recording:** the first version of this scenario passed a
`month` prop and the caption could not navigate — `month` is the _controlled_
displayed month. Using `defaultMonth` is required to exercise navigation at all.
A reader of the first failing result could easily have mistaken that for a
component defect; it was the fixture's error.

---

<a id="n-1"></a>

## N-1 — new observation · supported API restriction

While a Radix `Select` is open, the page outside the popup is shielded:

```
✓ while open, Radix sets pointer-events:none on the body (page is shielded)
✓ so the outside button is not hit-testable — elementFromPoint at the button is <HTML>
✓ outside click dismisses the popup
✓ and the click never reached the underlying button — 0
```

The DatePicker behaves the opposite way — no shield, and a dismissing click
_does_ reach whatever is underneath:

```
✓ unlike Select, the DatePicker does NOT shield the page — "auto"
✓ and the click DID reach the underlying button (no shield) — 1
```

Not a defect in either, but a real behavioral difference between the two popup
families, and it matters for consumers: a dismissing click on a Select is
swallowed, whereas on a DatePicker it also activates whatever it lands on.

---

<a id="n-2"></a>

## N-2 — new observation · harness artifact

Arrow-key selection depends on **key dwell time**, and getting this wrong nearly
produced a wrongly-filed high-severity defect.

Radix selects from an `onFocus` handler guarded by an "arrow key currently down"
flag that its `keyup` listener clears. An early version of this harness sent
`keyUp` immediately after `keyDown`. With that, raw Radix appeared to select
while openui's `RadioGroup` did not — openui's heavier item (an inline SVG plus
label and description) commits focus just late enough to land after the flag was
cleared. The run reported "openui RadioGroup does not select on arrow keys".

Holding the key for a few frames, as a human necessarily does, makes both behave
identically and correctly (see [G-1](#g-1)). `browser/cdp.mjs`'s `key()` now
holds for 60 ms by default and documents why.

**No defect.** Recorded because any future keyboard verification of these
components is sensitive to the same thing.

---

<a id="g-2"></a>

## G-2 — still unverified

`ToggleGroup`/`ToggleItem` are not `forwardRef`, so `ref` support depends on the
React major version. This harness installs React 19.2.4 only, where `ref` is an
ordinary prop and happens to work. Confirming the React 18 half needs an install
at the peer floor (`^18.3.1`), which would be a dependency change and is out of
scope for this ticket.

## Other #19 gaps, unchanged

- **G-5** `SliderBlock` — still untested; composes `Input`, owned by #9.
- **G-9** visual/theming/SSR/RTL — out of scope per #23.
- **G-10** superseded: a browser run has now happened. No timed performance run
  was made, so there was still no benchmark contention to coordinate.
