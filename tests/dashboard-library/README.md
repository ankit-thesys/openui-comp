# Dashboard library tests

This private workspace package keeps tests outside the shipped component library. Its separation follows `tests/intelligent-ui` on `origin/claude/intelligent-ui-tests`; this suite uses Vitest projects as required by the dashboard port.

Build dependencies and the library before running tests:

```sh
pnpm --filter '@openuidev/dashboard-library-next...' --workspace-concurrency=1 run build
pnpm --filter @openuidev/dashboard-library-tests test:node
pnpm --filter @openuidev/dashboard-library-tests exec playwright install chromium
pnpm --filter @openuidev/dashboard-library-tests test:browser
pnpm --filter @openuidev/dashboard-library-tests typecheck
```

The Node project covers Format (with literal expected values, imported from source since Format is internal), checks the catalog programs parse and the prompt offers his slots, snapshots `library.prompt()`, server-renders the ThemeProvider and checks its dev-mode warnings, and lints the library's css-tag selectors (goober splits selectors at every comma, even inside `:is()` or `:has()`). The browser tests run in Chromium twice, as `browser-react-19` (the workspace React) and `browser-react-18` (the `react-18` and `react-dom-18` aliases, the same approach as tests/intelligent-ui's host). They render OpenUI Lang programs through Renderer in light and dark modes and check theme defaults, modes, nesting, overrides, independent scopes across siblings and React roots, the portal class, Width spans and container breakpoints, reduced motion, KPI formats, delta tones and status shapes, compact strips, comparison sparklines, the card toolbar, streaming and override states, and Query loading, empty and failure handling.

Hydration tests server-render in a separate Node process (`ssr/render.mjs`, run by the `serverRender` browser command), as a real server does, with no window, then hydrate in the browser; neither step may log anything. For the React 18 project the script resolves `react` and `react-dom` to the React 18 aliases with `module.registerHooks`, which needs Node 22.15 or later.

Catalog fixtures live in `fixtures/`, one file per group like the library's `src/groups/`, so each group ticket adds its programs to its own file. The original Stat catalog entry includes TimeSeries; its rendering fixture keeps the Stat and omits that chart until the trends ticket lands. The original catalog entry is retained verbatim.
