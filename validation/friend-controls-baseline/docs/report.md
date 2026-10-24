# Baseline report — remaining form controls (issue #19)

## Baseline

| Item               | Value                                                                  |
| ------------------ | ---------------------------------------------------------------------- |
| Repository         | `ankit-thesys/openui-comp` (fork of `thesysdev/openui`)                |
| Baseline commit    | **`9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`**                         |
| Commit subject     | `Examples: keep chat history in localStorage, fix Eve imports (#1373)` |
| Branch             | `claude/quirky-morse-4357b9`                                           |
| Package under test | `packages/react-ui` @ `0.18.1`, **unchanged**                          |
| Owned directory    | `validation/friend-controls-baseline/`                                 |

`packages/react-ui` was treated as read-only throughout. No file outside the
owned directory was created or modified, and `pnpm-lock.yaml`,
`pnpm-workspace.yaml` and the root `package.json` are untouched.

## Tool and dependency versions

Recorded from the actual install, not from version ranges.

| Tool              | Version                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| OS                | macOS (darwin 27.0.0), arm64                                                                                        |
| Node              | 24.17.0                                                                                                             |
| pnpm              | 10.33.0                                                                                                             |
| TypeScript        | 5.9.3                                                                                                               |
| vitest            | 4.1.10                                                                                                              |
| vite              | 6.4.3                                                                                                               |
| jsdom             | 26.1.0                                                                                                              |
| react / react-dom | 19.2.4                                                                                                              |
| `@storybook/test` | 8.6.15 (bundles `@testing-library/dom` 10.4.0, `@testing-library/jest-dom` 6.5.0 and `@testing-library/user-event`) |
| storybook         | 8.6.18                                                                                                              |

Component dependencies exercised:

| Dependency                     | Version |
| ------------------------------ | ------- |
| `@radix-ui/react-select`       | 2.3.7   |
| `@radix-ui/react-slider`       | 1.4.7   |
| `@radix-ui/react-checkbox`     | 1.3.11  |
| `@radix-ui/react-radio-group`  | 1.4.7   |
| `@radix-ui/react-switch`       | 1.3.7   |
| `@radix-ui/react-toggle-group` | 1.1.19  |
| `@radix-ui/react-label`        | 2.1.15  |
| `react-day-picker`             | 9.14.0  |
| `date-fns`                     | 4.4.0   |
| `@floating-ui/react-dom`       | 2.1.3   |

**No browser engine was used.** There is no Playwright in this repository, and no
browser automation or timed performance run was performed — so no execution
window needed coordinating with the workers' performance runs (#19's coordination
note).

## Exact commands

Run from the **repository root**, after `pnpm install --frozen-lockfile`:

```bash
pnpm install --frozen-lockfile
```

```bash
pnpm --dir packages/react-ui exec vitest run --config ../../validation/friend-controls-baseline/vitest.config.ts
```

Single family (any substring of the file name):

```bash
pnpm --dir packages/react-ui exec vitest run --config ../../validation/friend-controls-baseline/vitest.config.ts tests/Select
```

Typecheck this directory (`tsconfig.json` is local to it and maps types to
react-ui's install, for the same reason the vitest config does):

```bash
pnpm --dir packages/react-ui exec tsc --noEmit -p ../../validation/friend-controls-baseline/tsconfig.json
```

Build the runnable consumer (proves it compiles; output is git-ignored):

```bash
pnpm --dir packages/react-ui exec vite build --config ../../validation/friend-controls-baseline/consumer/vite.config.ts
```

Serve the runnable consumer at <http://localhost:4319>:

```bash
pnpm --dir packages/react-ui exec vite --config ../../validation/friend-controls-baseline/consumer/vite.config.ts
```

### Why the commands look like this

`validation/` is **not** a pnpm workspace member — `pnpm-workspace.yaml` lists
only `packages/*` and `docs/` — so this directory gets no `node_modules` and bare
imports cannot resolve by directory walk-up. Rather than edit
`pnpm-workspace.yaml`, the root `package.json` or the lockfile, the harness runs
through `packages/react-ui`'s installed toolchain (`--dir`) and its own
`vitest.config.ts` resolves every bare specifier our files use to the copy
react-ui already has. Verified working before anything was built on it.

Three constraints found at this baseline shaped the harness:

1. `packages/react-ui` has **no vitest config** and **no jsdom dependency**; all
   pre-existing react-ui tests are node-environment SSR tests using
   `renderToString`. jsdom 26.1.0 _is_ resolvable from vitest's own context, so
   `environment: "jsdom"` works without adding a dependency.
2. `@testing-library/react` is **not in the lockfile at all**. There is therefore
   no `render()` to reuse, so `setup/render.tsx` is a ~60-line helper over
   `react-dom/client` + React 19's `act`. DOM queries, `userEvent` and the
   jest-dom matchers come from `@storybook/test`, already a react-ui
   devDependency.
3. React must be a **single instance** shared with the legacy source, or hooks
   and context break. The config aliases `react`/`react-dom` to react-ui's own
   resolved copies and sets `resolve.dedupe`.

No shared config, dependency or lockfile change was required, so nothing needed
to be proposed on the issue under #19's "propose before expanding scope" rule.

## Results

Full suite, run at the baseline commit:

```
 Test Files  15 passed (15)
      Tests  270 passed (270)
```

| Test file                                   | Tests   | Family                                         |
| ------------------------------------------- | ------- | ---------------------------------------------- |
| `tests/_harness.probe.test.tsx`             | 3       | harness self-check (not a component assertion) |
| `tests/Label.baseline.test.tsx`             | 7       | Label                                          |
| `tests/FormControl.baseline.test.tsx`       | 10      | FormControl + Hint                             |
| `tests/ButtonsIconButton.baseline.test.tsx` | 18      | Buttons + IconButton                           |
| `tests/CheckBox.baseline.test.tsx`          | 19      | CheckBoxItem + CheckBoxGroup                   |
| `tests/Radio.baseline.test.tsx`             | 22      | RadioGroup + RadioItem                         |
| `tests/Switch.baseline.test.tsx`            | 18      | SwitchItem + SwitchGroup                       |
| `tests/Toggle.baseline.test.tsx`            | 15      | ToggleGroup + ToggleItem                       |
| `tests/Chips.baseline.test.tsx`             | 19      | Chips                                          |
| `tests/OptionCards.baseline.test.tsx`       | 20      | OptionCards                                    |
| `tests/Slider.baseline.test.tsx`            | 28      | Slider                                         |
| `tests/Select.baseline.test.tsx`            | 27      | Select (all 8 parts)                           |
| `tests/Calendar.baseline.test.tsx`          | 21      | Calendar                                       |
| `tests/DatePicker.baseline.test.tsx`        | 28      | DatePicker                                     |
| `tests/LegacyConsumer.baseline.test.tsx`    | 15      | all families composed                          |
| **Total**                                   | **270** |                                                |

Typecheck: **0 errors** under the repository's own strict settings (the root
`tsconfig.json` sets `strict`, `noUncheckedIndexedAccess` and
`noPropertyAccessFromIndexSignature`, all inherited here).

Consumer build: `✓ built in 3.84s`, one 1.60 MB entry chunk plus per-icon
lucide chunks (an unsplit dev fixture; the size warning is expected and
harmless).

The typecheck is part of the evidence, not just hygiene: it is what established
that `IconButton`'s `icon` prop — though a required property — is typed
`ReactNode`, so `icon={null}` type-checks and renders an icon button with no
icon. It also verifies every `@ts-expect-error` in the suite, which is how the
closed-props finding ([FC-1](./defects.md#fc-1)) is shown to be a _type-level_
rejection as well as a runtime drop.

### Known failures

**None.** Every test passes, and that is deliberate: each one asserts the
baseline **as it actually is**, including the broken behavior. Issue #19 is
explicit that baseline defects are findings, not a requirement to make every
legacy test green — so a defect like `SelectTrigger hideDropdownIcon` is pinned
with `expect(...).rejects.toThrow(...)` rather than left failing. If a future
change fixes a defect, the corresponding test will start failing and should be
updated together with the fix.

### Determinism

All fixture inputs are literals in `fixtures/data.ts`; nothing derives from
`Date.now()` or `Math.random()`. `Calendar` and `DatePicker` default their
visible month to "today", so their suites fake **only** `Date` (via
`vi.useFakeTimers({ toFake: ["Date"], now: FIXED_DATE })`, pinned to
**2024-03-14**), leaving timers real so `userEvent` continues to work.
`Slider`'s formatter hardcodes the `"en-US"` locale, so its expected strings are
host-locale independent. The suite runs with `sequence.shuffle: false` and
`concurrent: false`; re-running it produces identical results.

## Findings summary

24 findings, all with minimal reproductions in
[defects.md](./defects.md). Severity is this harness's read, for triage only.

| Severity | Count | IDs                                                                 |
| -------- | ----- | ------------------------------------------------------------------- |
| high     | 5     | SE-1, DP-1, DP-2, DP-3, CA-2 (upstream)                             |
| medium   | 12    | SE-2, SE-3, IB-1, FC-1, CB-1, R-1, C-3, OC-2, CB-2, CA-1, SL-1, T-1 |
| low      | 7     | DP-4, S-1, C-2, OC-1, T-2, R-2, L-1                                 |

Most consequential for the planned migration:

1. **`SelectTrigger hideDropdownIcon` throws** (SE-1) — a declared prop that
   cannot be used at all.
2. **DatePicker is keyboard-inaccessible** (DP-1) and its controlled-state
   handling is broken in two distinct ways (DP-2, DP-3).
3. **`Calendar` does not re-read `selected` on re-render** (CA-2) — reproduced
   identically with raw `react-day-picker`, so it is upstream, but it means a
   consumer cannot drive the component through `selected` alone.
4. **Closed props interfaces** (FC-1) make six components unable to accept
   `id`/`aria-*`/`data-*`, while their siblings can — the main API-consistency
   decision the migration will have to make.
5. **ARIA roles that promise keyboard semantics the components do not implement**
   (C-3, OC-2) — a listbox and a radiogroup built from plain buttons.

Ten coverage gaps are recorded in
[observed-baseline.md](./observed-baseline.md#coverage-gaps); the ones needing a
real browser are G-1 (arrow-key selection), G-3 (nested-label activation),
G-4 (slider drag) and G-8 (popup geometry).

## Scope confirmation

In scope and covered: Buttons, Calendar, CheckBoxGroup, CheckBoxItem, Chips,
DatePicker, FormControl (+ Hint), IconButton, Label, OptionCards, RadioGroup,
RadioItem, Select (all 8 exported parts), Slider, SwitchGroup, SwitchItem,
ToggleGroup, ToggleItem — **18 of 18**.

Deliberately out of scope, with no duplicate ownership:

- `Button`, `Input`, `TextArea` — issue #9 / Worker 2. `Button` appears twice as
  an unavoidable child fixture (in the `Buttons` layout test and the consumer)
  with **no assertions about its own behavior**; `Input` is reached only
  indirectly through `SliderBlock`, which is documented and left untested (gap
  G-5).
- `packages/react-ui-core` scaffold, build config, theme APIs — Worker 1. Not
  touched. `ThemeProvider` is only read via `useTheme()`'s default value, which
  is what `SelectContent` and the DatePicker popup consume.
- `packages/react-ui/src/components/Charts/**` — issue #18. Not touched; the
  chart contributor's `validation/friend-chart-baseline/` is not read or written.
- No Goober/runtime patches, no production styling changes, no package
  publication, no deprecations.

`git status` shows changes only under `validation/friend-controls-baseline/`.
