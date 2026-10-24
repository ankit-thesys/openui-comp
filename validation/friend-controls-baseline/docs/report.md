# Baseline report — remaining form controls (issues #19, #23)

> **Issue #23 update.** A real-Chrome verification run now accompanies the jsdom
> suite. It **withdrew one high-severity finding** (CA-2 — a test-authoring error
> on my part, not a defect), **narrowed two** (SE-2, CB-1/R-1), **confirmed the
> other four high-severity findings** (SE-1, DP-1, DP-2, DP-3) and **closed six
> coverage gaps**. The classified results are in
> [verification-ledger.md](./verification-ledger.md), with raw output in
> [browser-results.json](./browser-results.json).

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

### Browser (added under #23)

| Item         | Value                                                                             |
| ------------ | --------------------------------------------------------------------------------- |
| Engine       | **Chrome/156.0.8078.47**, `--headless=new`                                        |
| CDP protocol | 1.3                                                                               |
| Driver       | `browser/cdp.mjs` — a ~250-line DevTools Protocol client, **no dependency added** |
| Viewport     | 1280×900                                                                          |

There is still **no browser-automation package in this repository**. Playwright,
Puppeteer, `@vitest/browser` and webdriverio appear in `pnpm-lock.yaml` only as
optional `peerDependencies` declarations (vitest's `@vitest/browser-*`,
`@chromatic-com/playwright`); none is resolved and none is in the pnpm store.
Adding one would be a shared dependency change, which both tickets forbid without
prior proposal, so the harness speaks CDP over Node 24's global `WebSocket`.

Input is genuinely trusted: `Input.dispatchMouseEvent` and
`Input.dispatchKeyEvent` produce events with `isTrusted === true`, which is what
makes the closed gaps meaningful.

No timed performance run was made, so there was no benchmark contention to
coordinate with the migration workers.

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

Real-Chrome verification (#23) — one command; it builds the fixture itself:

```bash
node validation/friend-controls-baseline/browser/run.mjs
```

Options: `--only <scenario>` for one scenario, `--json <path>` to write the
machine-readable result, `--no-build` to reuse an existing `browser/dist`. It
exits **0** only when every scenario completed AND every check passed; a scenario
that fails to load or errors is reported as a failure, never as passing coverage.
Exit **1** means check failures, exit **2** means the run could not be set up
(build failure, no Chrome, unknown scenario name).

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

### Why jsdom is available even though react-ui does not declare it

Worth spelling out, because the obvious check says it should not be:

```console
$ cd packages/react-ui && node -e "require.resolve('jsdom')"
MODULE_NOT_FOUND
```

react-ui genuinely does not declare `jsdom` (nine sibling packages do, and it is
in the `pnpm-workspace.yaml` catalog). But **vitest does not load its environment
from the package `--dir` points at — it loads it from its own resolution
context.** pnpm installs one shared vitest instance whose peer set already
includes jsdom, which its store path records verbatim:

```
node_modules/.pnpm/vitest@4.1.10_..._jsdom@26.1.0_vite@6.4.3_.../node_modules/vitest
                                    ^^^^^^^^^^^^
```

So `--dir packages/react-ui` supplies the toolchain and the component
dependencies, while the DOM environment comes from vitest itself.

This was verified empirically before anything was built on it, and the suite
asserts it rather than trusting it: `setup/vitest.setup.ts` throws if `document`
is missing, and `tests/_harness.probe.test.tsx` checks the DOM, the
single-React-instance aliasing, the React 19 `act` wiring, and that a `userEvent`
click reaches React state. A real DOM is load-bearing for most of the 270
assertions — focus order, `toHaveFocus`, key handling and portalled popup content
cannot pass without one.

**If this ever stops holding** (say a future install drops jsdom from vitest's
peer set) the suite fails loudly on that setup-file error rather than silently
degrading. The fallback is to run the same config through a package that declares
jsdom directly — `pnpm --dir packages/react-headless exec vitest run --config
../../validation/friend-controls-baseline/vitest.config.ts` — which needs no
change to this directory, because the config resolves React, `@storybook/test`
and the react-ui sources through `packages/react-ui` by absolute path regardless
of which package launches it.

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

### Browser results (#23)

```
browser : Chrome/156.0.8078.47
ALL GREEN: 61 passed, 0 failed, 10/10 scenarios completed
```

| Scenario              | Gaps / findings | Outcome                                       |
| --------------------- | --------------- | --------------------------------------------- |
| `radio-arrows`        | G-1             | arrow keys select; openui matches raw Radix   |
| `nested-label`        | G-3, CB-1, R-1  | single activation; no double-toggle           |
| `slider`              | G-4             | real drag `[200]→[800]`; track click `→[300]` |
| `select-geometry`     | G-8, N-1        | popup 2.0px below trigger; dismissal 3 ways   |
| `select-hide-icon`    | SE-1            | **throws** — confirmed                        |
| `select-textvalue`    | SE-2, G-6       | duplication confirmed; typeahead works        |
| `datepicker-geometry` | G-8, DP-1       | popup 5.0px below trigger; Tab skips trigger  |
| `datepicker-clear`    | DP-2            | **cannot clear** — confirmed                  |
| `datepicker-stuck`    | DP-3            | **stuck open** — confirmed                    |
| `calendar-caption`    | G-7             | caption menus and `multiple` mode work        |

Verified deterministic: three consecutive runs produced identical results
(61/61) with no leaked browser processes. Full per-check output, including the
measured geometry, is in [browser-results.json](./browser-results.json).

### Known failures

**None**, in either suite. That is deliberate: each one asserts the
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
3. **Closed props interfaces** (FC-1) make six components unable to accept
   `id`/`aria-*`/`data-*`, while their siblings can — the main API-consistency
   decision the migration will have to make.
4. **ARIA roles that promise keyboard semantics the components do not implement**
   (C-3, OC-2) — a listbox and a radiogroup built from plain buttons.

Of the ten coverage gaps #19 recorded in
[observed-baseline.md](./observed-baseline.md#coverage-gaps), **six are now
closed** by the browser run (G-1, G-3, G-4, G-6, G-7, G-8) and G-10 is
superseded. Three remain: G-2 (React 18 `ref`, needs an install at the peer
floor), G-5 (`SliderBlock`, composes `Input` which #9 owns) and G-9
(visual/theming/SSR/RTL, out of scope per #23).

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
