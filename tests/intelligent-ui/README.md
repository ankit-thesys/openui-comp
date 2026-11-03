# Intelligent UI library tests (fork only)

Tests for `@openuidev/intelligent-ui-library` (ankit-thesys/openui-comp#196), planned in
ankit-thesys/openui-comp#199. They live on the fork's `claude/intelligent-ui-tests` branch and are
never merged upstream; the library package itself stays test-free.

## Run

```bash
pnpm install
pnpm --filter @openuidev/intelligent-ui-tests build:library
pnpm --filter @openuidev/intelligent-ui-tests exec playwright install chromium
pnpm --filter @openuidev/intelligent-ui-tests test
```

`IU_PROGRAMS=web-analytics,map` renders other gallery programs, and `IU_PROGRAMS=all` renders every
one. `pnpm --filter @openuidev/intelligent-ui-tests host` serves the host page for a look by hand:
open `/?program=recipe&theme=dark&provider=0`.

## How it fits together

The seam is the browser: the built package, from `dist`, in a Vite SPA with no CSS reset, driven by
Playwright. The host imports only the package's root exports, through its `package.json`, so a broken
export or a stale build fails here as it would in an app.

There are three places to extend:

- **`harness/matrix.ts`** is the host matrix. Each host (React version, theme, ThemeProvider or not,
  width) is a Playwright project, so a failure names the host.
- **`harness/programs.ts`** is the program list: the gallery (`fixtures/gallery.json`) and the
  self-test programs, with the prompt's examples and model-written programs to come.
- **`harness/checks.ts`** is the list of automatic failures. Each check reads one rendered program
  and returns its problems; every check runs on every program.

`specs/render.spec.ts` renders each selected program on each host and runs every check.
`specs/self-test.spec.ts` feeds the checks broken programs, so a check that stops catching problems
fails the run. `harness/network.ts` answers the library's `/api/...` routes and every outside request,
so no run reaches the network. `host/mock-tools.ts` is the data the gallery's dashboards query.

`legacy/` holds #160's suites until the tickets in its README port them.
