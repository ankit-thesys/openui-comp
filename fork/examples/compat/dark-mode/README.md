# dark-mode: compatibility #169

Standalone production Vite SSR fixture on **5753**. Both `unlayered` and `layered`
(`openui`) modes are supported. React/React DOM 19.3.1 and Vite 8.3.5 are pinned to
current stable registry releases. TypeScript is 7.0.2. Playwright remains 1.56.1 as
required by the harness; Zustand remains in the library-supported 4.x peer range.

The default SSR route and the browser start in `<ThemeProvider mode="dark">`, using library defaults without app-supplied token CSS. The shared light baseline runs at `/?theme=light`. A separate JavaScript-disabled context checks dark server styling. A parser-time script samples the theme probe before the client module; requestAnimationFrame samples continue through hydration. The browser test holds the client module until the server HTML has two animation frames to paint, then attaches `first-paint.json` including `flashed`, toggles light then dark, and requires zero flash and no duplicate rules.

The server follows the ADR’s document-head recipe: optional layer order, one full
`<style data-openui-styles>`, then app CSS and the initially disabled single-class
override stylesheet. The browser inherits its layer from the server sheet.
`tests/contract.ts` checks post-interaction sheets locally because the shared
`smoke()` always navigates; all shared assertions stay enabled.

## Run

From the repository root:

```sh
node fork/examples/compat/scripts/install-library.mjs dark-mode --update-lockfile
OPENUI_COMPAT_MODE=unlayered pnpm --dir fork/examples/compat/dark-mode build
pnpm --dir fork/examples/compat/dark-mode start --port 5753
OPENUI_COMPAT_MODE=unlayered pnpm --dir fork/examples/compat/dark-mode test:smoke --list
pnpm --dir fork/examples/compat smoke dark-mode
```

Use `--update-lockfile` only for initial creation or an intentional dependency change.
The last command owns install/build/server cleanup and runs Chromium in both modes.
It must run on the orchestrator; this sandbox cannot launch Chromium.

## Findings

**Known limitation, pinned:** dark server HTML has no theme tokens. ThemeProvider writes them in
an insertion effect and the token defaults register only in the browser, as the package README's
"Server-rendered styles" documents; production react-ui's ThemeProvider does the same, and the
documented ThemeProvider setup cannot avoid it. The page first paints unthemed, shows the light
token defaults once the client module evaluates, and turns dark when ThemeProvider commits. The
JavaScript-disabled test and the first-paint test pin that exact sequence and annotate it as a
known limitation, so emitting theme tokens on the server makes them fail until they are switched
back to requiring dark. After hydration, dark mode, both toggles, the sheets and the console are
checked as before.

No shared harness files are changed.
