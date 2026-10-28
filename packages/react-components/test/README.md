# react-components tests

Tests exercise the **built** package through its public exports only, the way a consumer uses it. Build first:

```bash
pnpm --filter @openuidev/react-components build
```

## Unit tests (Node, vitest)

`test/unit/**/*.test.{ts,tsx}` import `@openuidev/react-components` and server-render components.

```bash
pnpm --filter @openuidev/react-components test
```

## Browser tests (Chromium, Playwright)

`test/browser/*.spec.ts` load fixture apps in Chromium and assert what the page shows.

- `test/browser/fixtures/<name>.tsx` is a small app that imports `@openuidev/react-components` and renders into `#root`.
- Playwright's global setup (`build-fixtures.ts`) bundles each fixture with tsdown, as a consumer's bundler would, into `test/browser/.fixtures/` (gitignored). CSS imports become empty modules there; no fixture renders math, which is the only package code that imports a stylesheet.
- `serve.mjs` serves `/<name>.html` (an empty page that loads `/<name>.js`) on port 5370 (override with `OPENUI_TEST_PORT` when several worktrees run browser tests at once). Playwright starts it.

Install Chromium once, then run:

```bash
pnpm --filter @openuidev/react-components exec playwright install chromium
pnpm --filter @openuidev/react-components test:browser
```

To add a browser test, add a fixture that imports `openui-under-test` (aliased to the built package), add it to `fixtures` in `build-fixtures.ts`, and open `/<name>.html` from the spec. Query parameters build the static `<head>`, all loaded before the fixture script:

- `?css=<text>` adds a consumer stylesheet.
- `?sheet=<name>` links `fixtures/<name>.css`.
- `?recipe=<layer order>` starts `<head>` with the layer-mode recipe: `<style>@layer <layer order>;</style><style id="_goober"> </style>`.

`fixtures/tailwind4.css` is unmodified Tailwind 4.1.11 CLI output (`@import "tailwindcss"` with `bg-red-500` and `!bg-red-500` as the only sources), checked in so the tests need no Tailwind dependency. Regenerate it the same way if the tests need more utilities.

## Styling contract

`test/unit/contract/` enforces the styling contract (README, "Styling and overrides") at the Node seam.

- `components.tsx` lists every migrated component with elements covering every value of every
  prop that changes its classes. `contract.test.tsx` server-renders them through public exports,
  collects the CSS registered while rendering (`collect.ts`: what the render added to the public
  `getComponentStyles()` sheet), and checks:
  - every selector is one generated class, optionally with one state, a sibling pair
    (`.go1 + .go1`) or a zero-weight `:where(.go1) <type selectors>` rule, and no rule is layered;
  - the same elements rendered under `<ThemeProvider cssLayer="openui">` put every rule in
    `@layer openui` (no unlayered rule, no other or nested layer), within the same budget and
    with the same selector shapes;
  - every rendered `openui-*` class matches `openui-<block>[--<prop>-<value>]`, a modifier attaches
    to a documented root or part, and the rendered classes equal the component's `names`.
- `checks.ts` holds the selector, layer and class grammar; `checks.test.ts` feeds it deliberately
  broken selectors, layered rules and names so a passing contract test means something.
- `reference.test.ts` fails when `docs/reference/selectors.md` differs from what
  `scripts/selector-reference.mjs` generates from the built `names`. Regenerate it after a build:

```bash
pnpm --filter @openuidev/react-components docs:selectors
```

### Migration allowlist

`test/flat-allowlist.json` lists the source modules still on the old styling: they import Goober
themselves and register CSS on import. `allowlist.test.ts` fails if a module that imports Goober is
missing from it, if a listed module no longer imports Goober (or no longer exists), or if a
component that exports `names` is missing from `components.tsx`. `src/styles/defaults.ts` (theme
token defaults), `src/styles/useStyles.ts` and `src/utils/componentStyles.ts` are exempt.

When you convert a component: remove its modules from the allowlist, add it to `components.tsx`,
regenerate the reference, and add a parity spec. The list must be empty before a stable release.

## Parity with #72

Converted components must render exactly as they did before the flat-styles pilot. A parity spec
(`<component>.parity.spec.ts`) snapshots computed styles of every `[data-parity-case]` element in
a `parity-<component>` fixture, plus its `[data-parity-part]` children, at rest, hovered and pressed,
in light and dark. It compares them with `parity/baselines/<component>.json`, captured from the
source at #72's head (`5e09b37c`). A case's id names its props, so a component with renamed props
renders the same cases from both sources: `__PARITY_BASELINE__` is `true` in the baseline bundle.

Pass design changes that are meant to differ to `checkParity(page, name, intentional)` as
`"<snapshot key> <property>"` entries and list them in the PR.

To add a component: write `fixtures/parity-<component>.tsx`, add it to `fixtures` in
`build-fixtures.ts`, add a spec calling `checkParity(page, "<component>")`, then capture its
baseline (this extracts the #72 source into `test/browser/.baseline/`, gitignored):

```bash
pnpm --filter @openuidev/react-components test:parity:baseline
```

Commit the new baseline file. Recapture only when adding cases, never to absorb a regression.

## CI

- `pnpm run ci` (typecheck of `src` and tests, unit tests, lint of `src`, format) needs the build too, because tests import the built package; in CI it runs in the shared `build-js.yml` step after all packages are built.
- Browser tests run in the separate `react-components-browser` job in `build-js.yml`, which builds this package, installs Chromium and runs `test:browser`.
