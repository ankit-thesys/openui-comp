# Component compatibility harness

This fork-only harness tests the **packed** component library in standalone production apps.
It implements [#164](https://github.com/ankit-thesys/openui-comp/issues/164), under
[#162](https://github.com/ankit-thesys/openui-comp/issues/162). Tier 1 gates the main PR;
`vite-spa` proves the harness, and the framework tickets add the rest of that tier.

Use Node 22.12+ and pnpm 10.33.0. Install the repository's build tooling first with the root
`pnpm install --frozen-lockfile` if it is not already available. The harness does not install or
download browser binaries. On a machine allowed to run Chromium, install the Playwright browser
after the first library install:

```sh
pnpm --dir fork/examples/compat install-library vite-spa
pnpm --dir fork/examples/compat/vite-spa exec playwright install chromium
```

## Run one app or all apps

From the repository root:

```sh
# Build the library, pack it, and install into one app (or replace vite-spa with all).
pnpm --dir fork/examples/compat install-library vite-spa

# Install, build, start production, run smoke, stop; both modes by default.
pnpm --dir fork/examples/compat smoke vite-spa
pnpm --dir fork/examples/compat smoke all

# Select one build mode.
pnpm --dir fork/examples/compat smoke vite-spa --mode=layered
pnpm --dir fork/examples/compat smoke vite-spa --mode=unlayered

# Browser-free verification: same install/build/start/stop lifecycle, but only list the spec.
pnpm --dir fork/examples/compat smoke vite-spa --list-tests
```

The runner prints a table with app, mode, port, PASS/FAIL and the last stage. Any failed stage
returns a nonzero exit status. Apps run concurrently on separate ports; each app's modes run
sequentially because they share its build output and port. It refuses occupied ports, waits for
an HTTP success response, and terminates the production server's entire process group after
success, failure or an interrupt. The runner uses POSIX process groups (macOS/Linux).

To inspect a production build manually after installing:

```sh
cd fork/examples/compat/vite-spa
OPENUI_COMPAT_MODE=layered pnpm build
pnpm start --port 5700
# In another terminal in this app:
OPENUI_COMPAT_MODE=layered pnpm test:smoke
```

`OPENUI_COMPAT_MODE` must match for the build and spec; the ready selector checks the rendered
mode, so an accidentally reused build fails. `pnpm test:smoke --list` never starts a server or a
browser. Direct smoke execution expects an already running production server.

## Workspace isolation and tarballs

The root workspace's `fork/*` glob only matches immediate children, not these nested apps.
The harness package and **every app** also have their own `pnpm-workspace.yaml` with
`packages: []`. This makes `pnpm install` inside an app stop at that app, ignoring the ancestor
workspace. Keep these boundaries when adding apps. Each app commits its own `pnpm-lock.yaml`;
the harness package has no dependencies and needs no install. Do not add compat dependencies to
the root workspace, its lockfile, or `packages/react-components`.

`scripts/install-library.mjs` builds `@openuidev/react-components`, runs `pnpm pack`, and puts
the archive in the ignored `.pack/` directory. It rewrites each selected app's dependency to
`file:../.pack/openui-react-components-<content-hash>.tgz` and installs it. The content hash
prevents a changed library from reusing a cached resolution for an older tarball. Paths in the
manifest and lockfile stay relative. A fresh checkout must run this installer to recreate the
ignored tarball before a direct app install; the runner does this automatically. The installer
may update the app lockfile when library content changes. Library sources are never aliased or
linked into the app. Do not run two installers concurrently against the same checkout.

Versions are exact in each app. The initial Vite fixture pins React/React DOM 19.3.1 and Vite
8.3.5 from the registry's stable dist-tags ([React releases](https://react.dev/versions),
[Vite releases](https://vite.dev/releases)), and Playwright 1.56.1 to match
`fork/react-components-dev`. Zustand stays in the library's supported 4.x peer range.

## Port table

`ports.json` is the only allocation table. Both the runner and each Playwright config read it.

| App        | Port | Modes                  |
| ---------- | ---- | ---------------------- |
| `vite-spa` | 5700 | `unlayered`, `layered` |

Allocate the next unused integer, starting at 5700. Do not add per-app port environment defaults
or silently fall back to another port. The runner validates unique allocations.

## Smoke contract

Each app has one spec importing `shared/smoke.ts`. It takes the app's own `page` and `expect` so
the shared directory needs no installed Playwright copy. It listens before navigation for
console errors, hydration messages and uncaught errors. It checks:

- Default light-theme computed background, corner radius, four padding edges and font size on
  Button, Card, Input (the text-input API), SelectTrigger, Tabs and its active trigger, and
  MiniLineChart. Chart layout and a nonempty drawing are checked too.
- At most one `style#openui-styles`, at most one separate server sheet, and nonempty parsed CSS.
  The SPA explicitly requires zero server sheets. SSR apps should request one and mark it with
  `data-openui-styles` or use React's `data-href="openui-styles"` hoisted tag.
- Zero exact duplicate CSSOM rules across those sheets. Grouping conditions such as media
  queries form part of rule identity; layer wrappers and append-batch boundaries do not.
  Keyframes are compared as complete named rules, avoiding false duplicates between frames.
- An app-owned normal stylesheet with the single-class rule
  `.openui-button { background-color: rgb(1, 2, 3); }` wins. The fixture loads that stylesheet
  with `media="not all"`, then the helper enables it **after** checking the default styles.
  The test does not inject CSS or add selector specificity.
- Every component rule belongs to the configured layer in layered mode; unlayered mode checks
  the absence of component layers. Token defaults and ThemeProvider sheets are separate from
  the component sheets and deliberately excluded from these two checks.

`shared/default-theme.json` contains a fixed subset copied from
`fork/react-components-dev/test/browser/parity/baselines/`. Every sample records its source
file and case key. It uses Card's `clear/standard` case (explicit nonzero radius/padding), the
medium primary Button, default Input and closed default Select, title Tabs and a nonanimated
linear mini chart. No browser-dependent font metrics, screenshots or generated class hashes
are compared. Update this record only after reviewing intentional changes in those references.

All checks default on. `SmokeOptions.assertions` can disable individual `console`, `styles`,
`sheets`, `duplicates`, `override`, or `layer` checks when a framework ticket explains why.
`serverSheets` is optional, and `layer` is a layer name or `false`. `path`, `ready`, `samples`
and `enableOverrides(page)` adapt navigation, readiness, sample selectors and the app's own
override toggle. Passing custom samples replaces the built-in chart drawing check too.

## Add an app

1. Create `fork/examples/compat/<name>/` with its own private `package.json`,
   `pnpm-workspace.yaml` (`packages: []`) and lockfile. Pin exact dependencies, including the
   same Playwright version. Do not use workspace protocols, source aliases or library symlinks.
2. Add its name and unused port to `ports.json`. Import that table in its Playwright config.
   Bind production to `127.0.0.1`; reject occupied ports.
3. Provide `build`, `start` and `test:smoke` scripts. `build` must typecheck app and spec;
   `start --port <number>` must serve the production build. Read `OPENUI_COMPAT_MODE` at build
   time. By default the runner tests both modes; a limited app can declare
   `"compat": { "modes": ["unlayered"] }` in its package manifest.
4. Render the fixed samples under `<ThemeProvider mode="light">` and a visible
   `[data-compat-ready]` element. Reuse the fixture's sample props and the app-owned override
   stylesheet convention, or pass appropriate helper options.
5. Follow the [append-only framework setup](../../react-components-dev/docs/adr/0002-hookfree-css.md#framework-setup).
   Browser layered apps configure before the first microtask write and put the layer-order
   statement before an empty browser sheet in head. Vite's HTML transform emits this only for
   layered builds. SSR apps inline the full `/styles` sheet once before app CSS; React Server
   Components apps use `<ComponentStyles layer="openui" />`. No registry is needed. For Next
   unlayered apps, import app CSS in a page/nested layout as specified in the ADR.
6. Import `smoke` in the app's single Playwright spec, passing its `page`, `expect` and mode.
   For shared type imports, copy the Vite tsconfig's type-only `@compat/playwright` path mapping
   to that app's own installation and include `../shared/*.ts`. Keep runtime imports of
   `@playwright/test` unmapped so Playwright's ESM export resolves normally in the
   app. Configure no automatic browser/server startup during `--list`.
7. Run `install-library <name>`, commit only that app's relative manifest/lockfile changes, and
   verify build, typecheck and test listing. Run `smoke <name>` on the orchestrator for real
   Chromium checks in both modes. Add the allocation and any justified check exceptions here.

Compat ignores dependency directories, tarballs, build output and Playwright results locally.
Keep additional framework-specific generated output ignored as apps are added.
