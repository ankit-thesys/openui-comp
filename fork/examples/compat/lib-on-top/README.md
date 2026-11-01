# lib-on-top: compatibility #169

Standalone production Vite SSR fixture on **5751**. Both `unlayered` and `layered`
(`openui`) modes are supported. React/React DOM 19.3.1 and Vite 8.3.5 are pinned to
current stable registry releases. TypeScript is 7.0.2. Playwright remains 1.56.1 as
required by the harness; Zustand remains in the library-supported 4.x peer range.

The local `src/tiny-library/` folder uses only public `css`/`keyframes`. Its own `styles.ts` entry eagerly retains both style modules and calls the upstream `/styles` collector. The SSR entry imports this local collector before rendering. A PriceCard is rendered on the server; LazyBadge is imported only after a click in the browser. A JavaScript-disabled context checks pre-hydration styling and keyframes. The browser path checks lazy styling, unchanged server text and total rule count, and no exact duplicate rules.

The server follows the ADR’s document-head recipe: optional layer order, one full
`<style data-openui-styles>`, then app CSS and the initially disabled single-class
override stylesheet. The browser inherits its layer from the server sheet.
`tests/contract.ts` checks post-interaction sheets locally because the shared
`smoke()` always navigates; all shared assertions stay enabled.

## Run

From the repository root:

```sh
node fork/examples/compat/scripts/install-library.mjs lib-on-top --update-lockfile
OPENUI_COMPAT_MODE=unlayered pnpm --dir fork/examples/compat/lib-on-top build
pnpm --dir fork/examples/compat/lib-on-top start --port 5751
OPENUI_COMPAT_MODE=unlayered pnpm --dir fork/examples/compat/lib-on-top test:smoke --list
pnpm --dir fork/examples/compat smoke lib-on-top
```

Use `--update-lockfile` only for initial creation or an intentional dependency change.
The last command owns install/build/server cleanup and runs Chromium in both modes.
It must run on the orchestrator; this sandbox cannot launch Chromium.

## Findings

No library-on-top-specific defect has been established without Chromium. Curl confirms both local style modules and the keyframes are in the single server sheet exactly once.

No shared harness files or library files are changed. No assertion is disabled.
