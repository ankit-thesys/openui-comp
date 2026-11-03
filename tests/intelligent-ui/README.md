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

## The rendering sweep (#201)

`specs/sweep.spec.ts` renders every gallery program, every prompt example and every past
regression on all 16 hosts: React 19 and 18, light and dark, with and without ThemeProvider, at
1280px and 390px. Each one goes through every check in `harness/checks.ts`; the page checks it
adds (horizontal scroll, boxes sticking out of what they sit in, overlapping siblings, bad text
values, broken images, empty drawings, maps without a canvas or pins) are in
`harness/page-checks.ts`. It also checks that a `Card`, `Row` or `Box` root inside ThemeProvider
gets the library's palette. `specs/layout.spec.ts` holds the layout checks ported from #160.

`harness/sweep-reporter.ts` writes the pass/fail table to `sweep-report/sweep.md`, and to the job
summary on GitHub Actions. `IU_REACT=18 pnpm host` serves the React 18 build by hand.

## The prompt seam and the package (#202)

`playwright.prompt.config.ts` runs `prompt/` in Node, with no browser or host:

```bash
pnpm --filter "@openuidev/cli..." run build
pnpm --filter @openuidev/intelligent-ui-tests exec playwright test --config playwright.prompt.config.ts
```

- `prompt/prompt.spec.ts` runs `openui generate` on `prompt/entry.ts`, the README's one-line re-export. It checks that every component, `@function` and action is in the prompt, and that every example parses with a `Col` root and no errors, unresolved or orphaned nodes. It also checks that the CLI prints no warning beyond the Map's `import.meta` one, and that the prompt matches `prompt/__snapshots__/prompt.txt`. After a deliberate prompt change, rerun it with `--update-snapshots` and review the diff. `IU_CLI` points the run at another CLI build.
- `prompt/library.spec.ts` checks the library's counts (55 components in 6 groups, 59 `@functions`, one action) through the root exports. It also checks that the gallery parses and names every component.
- `prompt/packaging.spec.ts` checks the built package in plain Node (import and require), with publint and attw. It checks that `npm pack` holds only `dist` and the README, and that the README's TypeScript samples compile against the published types under Bundler and NodeNext resolution.

`.github/workflows/intelligent-ui-prompt.yml` runs these after a frozen install and a build. `specs/examples.spec.ts` renders the prompt's examples in the host, like the gallery.
