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

The Node project snapshots `library.prompt()`, server-renders the ThemeProvider and checks its dev-mode warnings, and reserves a todo for the Format port. The browser tests run in Chromium twice, as `browser-react-19` (the workspace React) and `browser-react-18` (the `react-18` and `react-dom-18` aliases, the same approach as tests/intelligent-ui's host). They render OpenUI Lang layout programs through Renderer and check theme defaults, modes, nesting, overrides, independent scopes across siblings and React roots (client-rendered and hydrated), the portal class, Width spans and container breakpoints, and reduced motion. Cards intentionally contain no visuals until the subsequent component tickets land.
