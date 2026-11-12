# Dashboard library tests

This private workspace package keeps tests outside the shipped component library. Its separation follows `tests/intelligent-ui` on `origin/claude/intelligent-ui-tests`; this suite uses Vitest projects as required by the dashboard port.

Build dependencies and the library before running tests:

```sh
pnpm --filter '@openuidev/dashboard-library...' --workspace-concurrency=1 run build
pnpm --filter @openuidev/dashboard-library-tests test:node
pnpm --filter @openuidev/dashboard-library-tests exec playwright install chromium
pnpm --filter @openuidev/dashboard-library-tests test:browser
pnpm --filter @openuidev/dashboard-library-tests typecheck
```

The Node project covers Format (with literal expected values, imported from source since Format is internal), checks the catalog programs parse and the prompt offers his slots, snapshots `library.prompt()`, server-renders the ThemeProvider and checks its dev-mode warnings, and lints the library's css-tag selectors (goober splits selectors at every comma, even inside `:is()` or `:has()`). The browser tests run in Chromium twice, as `browser-react-19` (the workspace React) and `browser-react-18` (the `react-18` and `react-dom-18` aliases, the same approach as tests/intelligent-ui's host). They render OpenUI Lang programs through Renderer in light and dark modes and check theme defaults, modes, nesting, overrides, independent scopes across siblings and React roots, the portal class, Width spans and container breakpoints, reduced motion, KPI formats, delta tones and status shapes, compact strips, comparison sparklines, the card toolbar, streaming and override states, and Query loading, empty and failure handling.

Hydration tests server-render in a separate Node process (`ssr/render.mjs`, run by the `serverRender` browser command), as a real server does, with no window, then hydrate in the browser; neither step may log anything. For the React 18 project the script resolves `react` and `react-dom` to the React 18 aliases with `module.registerHooks`, which needs Node 22.15 or later.

Catalog fixtures live in `fixtures/`, one file per group like the library's `src/groups/`, so each group ticket adds its programs to its own file. The original Stat catalog entry includes TimeSeries; its rendering fixture keeps the Stat and omits that chart until the trends ticket lands. The original catalog entry is retained verbatim.

## Preview comparison (verification, not CI)

`compare/` checks the library against the dashboards-ui-library live preview, https://openui-dashboards.vercel.app (ankit-thesys/openui-comp#230, spec #229). It is a manual verification script: no Vitest project includes it and CI never runs it, because it needs the network and takes several minutes. Build the library first, then:

```sh
pnpm --filter '@openuidev/dashboard-library...' --workspace-concurrency=1 run build
pnpm --filter @openuidev/dashboard-library-tests exec playwright install chromium
pnpm --filter @openuidev/dashboard-library-tests compare
```

- **What it covers.** It covers the three examples and every building-block page in the preview's navigation, in light and dark. On a block page it walks every combination of each section's version radios, plus each "Show" option on its own, and measures each distinct program the preview shows.
- **How it compares.** One routine, `compare/measure.js`, runs unchanged on both sides:
  - on the preview (`compare/his.mjs`);
  - on the same program rendered by the library through `ThemeProvider` and `Renderer` (`compare/ours.mjs`, with the Vite host in `compare/host/`).

  The host imports the library from source, as the browser tests do, because it needs one host override: `CompareOverride`. The preview forces "compare to previous period" on for a specimen whose "Previous period" option is ticked, and the host does the same. After a restructure, only that import path may need updating.

- **What it measures.** Each card, plus the FilterBar, Kpis strips and section heads outside cards:
  - the box and computed styles;
  - every element's prefix-stripped classes, roles and ARIA attributes, text, box and styles;
  - each SVG's mark counts, fills, strokes and labels.
- **What it does.** It also drives every radio group (with ArrowRight, End and Home), the sort toggles, the sortable table headers and the popover filters, and hovers each chart and grid.
- **Same conditions.** Programs are captured from the preview at run time. The preview has no program panel for the examples, so their sources are read from its bundle as it loads. The preview's own page rules that restyle library classes inside its specimens are also read at run time, for example the specimen Dashboard's padding or the static FilterBar. The host applies them, prefix swapped, inside the same `dl-specimen` / `dl-program` wrappers. Both sides run in the same Chromium:
  - a 1280x900 viewport;
  - reduced motion;
  - Arial forced;
  - dashboard content of the same width.

  Every scroll container is reset before a unit is measured. Recharts and React ids, `url(#…)` targets and the positions of empty boxes are left out.

- **Results.** `compare/diff.mjs` compares value by value, with 0.5px tolerance, and classifies each difference with `compare/known.mjs`: a known deliberate difference, a preview-only page style, or a real gap. The run prints a summary per theme, and writes the raw JSON and `summary.md` under `.workspace/dashboard-compare/<time>/`, which git ignores.
- **Options.**
  - `--only retail,maps` limits the pages.
  - `--theme dark` runs one theme.
  - `--save-baseline` rewrites the committed baseline: `compare/baseline.md` (per program, values compared and every difference with its cause) and `compare/baseline.json` (difference paths only).

  A run without `--save-baseline` also lists any difference that isn't in the baseline, and fails if there are any.
