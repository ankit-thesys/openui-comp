# `friend-controls-baseline` — form-control baseline evidence (issue #19)

Independent, source-linked evidence of how the **remaining form controls** in
`packages/react-ui` behave today, so a later migration slice has something
concrete to migrate _against_.

Baseline commit: **`9d73d17d2bbac565672a85e78f6eb7740cb0d9ca`**.
`packages/react-ui` is treated as **read-only** — nothing in it was changed.

## Start here

| Document                                                 | What it holds                                                                                                                                                                                                               |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [docs/behavior-matrix.md](./docs/behavior-matrix.md)     | The public behavior matrix: exported parts, real props, defaults and event payloads for all 18 families, citing source paths and line numbers, with **native DOM attributes kept separate from custom component behavior**. |
| [docs/observed-baseline.md](./docs/observed-baseline.md) | What was actually observed per family, plus the **10 explicit coverage gaps** and the harness's own limits.                                                                                                                 |
| [docs/defects.md](./docs/defects.md)                     | **24 findings** with minimal reproductions, severity and source citations.                                                                                                                                                  |
| [docs/report.md](./docs/report.md)                       | Baseline SHA, exact tool versions, exact commands, results, determinism notes and scope confirmation.                                                                                                                       |

## Running it

Prerequisite, from the repository root (the lockfile must not change):

```bash
pnpm install --frozen-lockfile
```

Full suite — **275 tests across 15 files, all passing** at the baseline commit:

```bash
pnpm --dir packages/react-ui exec vitest run --config ../../validation/friend-controls-baseline/vitest.config.ts
```

One family at a time:

```bash
pnpm --dir packages/react-ui exec vitest run --config ../../validation/friend-controls-baseline/vitest.config.ts tests/Select
```

Typecheck (0 errors; inherits the repo's strict settings):

```bash
pnpm --dir packages/react-ui exec tsc --noEmit -p ../../validation/friend-controls-baseline/tsconfig.json
```

### Real-Chrome verification (#23)

One command, from the repository root — it builds the fixture itself:

```bash
node validation/friend-controls-baseline/browser/run.mjs
```

**61 checks across 10 scenarios, all passing** against Chrome/156.0.8078.47, with
no browser-automation dependency: `browser/cdp.mjs` speaks the DevTools Protocol
over Node's global `WebSocket`. Input is genuinely trusted, which is what closed
six of the gaps jsdom left open.

Options: `--only <scenario>`, `--json <path>`, `--no-build`. Exit 0 only if every
scenario completed and every check passed; 1 for check failures, 2 for a setup
problem.

### Running the consumer

`fixtures/LegacyConsumerApp.tsx` is a real app wiring every in-scope family with
local state, change callbacks, disabled cases and a live value summary. Serve it
at <http://localhost:4319>:

```bash
pnpm --dir packages/react-ui exec vite --config ../../validation/friend-controls-baseline/consumer/vite.config.ts
```

Or just check that it compiles (output lands in the git-ignored `consumer/dist/`):

```bash
pnpm --dir packages/react-ui exec vite build --config ../../validation/friend-controls-baseline/consumer/vite.config.ts
```

The same fixture is driven end-to-end from
`tests/LegacyConsumer.baseline.test.tsx`, so the consumer is exercised whether or
not you open a browser.

## Why the commands are shaped like this

`validation/` is not a pnpm workspace member, so this directory has no
`node_modules`. Everything runs through `packages/react-ui`'s installed
toolchain, and `vitest.config.ts` resolves each bare specifier to the copy
react-ui already has. **No shared config, dependency or lockfile change was
needed.** `docs/report.md` explains the three baseline constraints behind this
(no vitest config and no jsdom in react-ui, no `@testing-library/react` in the
lockfile, and the single-React-instance requirement).

## Layout

```
validation/friend-controls-baseline/
├── README.md                 you are here
├── vitest.config.ts          jsdom + resolution shim; no shared config touched
├── tsconfig.json             local typecheck; maps types to react-ui's install
├── .gitignore                keeps consumer/dist out of git
├── setup/
│   ├── vitest.setup.ts       act wiring + the jsdom shims, each one named
│   └── render.tsx            minimal React 19 render helper (no @testing-library/react)
├── fixtures/
│   ├── data.ts               every fixture input, all literals
│   └── LegacyConsumerApp.tsx the runnable consumer
├── consumer/                 browser entry for the consumer (index.html, main.tsx, vite.config.ts)
├── browser/                  real-Chrome verification (#23)
│   ├── cdp.mjs               minimal DevTools Protocol client, no dependencies
│   ├── serve.mjs             tiny static server + free-port helper
│   ├── run.mjs               the 10 scenarios and the runner
│   └── fixture/              the scenario page (real component SCSS included)
├── tests/                    14 family suites + 1 harness self-check
└── docs/                     the five documents above
```

## Reading the tests

Each suite is organised by contract — rendered output, controlled vs
uncontrolled, change payloads, keyboard/focus, disabled, popup/portal — and every
assertion that encodes a **defect** says so inline and links its finding ID, so
nobody later mistakes a pinned bug for intended behavior. Non-interactive
families (`Label`, `FormControl`, `Buttons`) document their association/layout
role instead of inventing interaction requirements.

Where a behavior could not be verified honestly, it is a gap in
[docs/observed-baseline.md](./docs/observed-baseline.md#coverage-gaps), not a
weaker assertion. Control groups matter here: several suites render the underlying primitive
alongside the openui component in the same test, so a finding can be attributed
to the wrapper or to the dependency rather than guessed at — see
`tests/Radio.baseline.test.tsx` (raw Radix) and `tests/Calendar.baseline.test.tsx`
(raw `react-day-picker`).

A caution learned the hard way, recorded in
[docs/verification-ledger.md#ca-2](./docs/verification-ledger.md#ca-2): a control
group is only as good as the inputs it shares. #19's CA-2 finding omitted
`onSelect` on **both** arms, so the comparison corroborated a mistaken reading
instead of catching it. That finding is now withdrawn.
