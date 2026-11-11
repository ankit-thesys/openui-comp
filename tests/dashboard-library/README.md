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

The Node project snapshots `library.prompt()` and reserves a todo for the Format port. The Chromium project renders OpenUI Lang layout programs through Renderer and checks theme defaults, modes, nesting, overrides, and independent scopes. Cards intentionally contain no visuals until the subsequent component tickets land.
