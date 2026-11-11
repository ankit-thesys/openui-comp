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

The Node project covers Format (with literal expected values), checks the catalog programs parse, snapshots `library.prompt()`, server-renders the ThemeProvider and checks its dev-mode warnings. The browser tests run in Chromium twice, as `browser-react-19` (the workspace React) and `browser-react-18` (the `react-18` and `react-dom-18` aliases, the same approach as tests/intelligent-ui's host). They render OpenUI Lang programs through Renderer in light and dark modes and check theme defaults, modes, nesting, overrides, independent scopes across siblings and React roots (client-rendered and hydrated), the portal class, Width spans and container breakpoints, reduced motion, KPI formats and delta tones, compact strips, comparison sparklines, shared states, and Query loading, empty and failure handling.

The original Stat catalog entry includes TimeSeries; its rendering fixture keeps the Stat and omits that chart until the trends ticket lands. The original catalog entry is retained verbatim.
