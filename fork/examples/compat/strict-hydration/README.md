# strict-hydration: compatibility #169

Standalone production Vite SSR fixture on **5752**. Both `unlayered` and `layered`
(`openui`) modes are supported. React/React DOM 19.3.1 and Vite 8.3.5 are pinned to
current stable registry releases. TypeScript is 7.0.2. Playwright remains 1.56.1 as
required by the harness; Zustand remains in the library-supported 4.x peer range.

Both `renderToString` and `hydrateRoot` wrap the same tree in React 19 `<StrictMode>`. The spec keeps the shared hydration/duplicate checks, captures `onRecoverableError`, imports a browser-only component, and rerenders state before checking all rules again. This ticket runs production only; React’s development-only double effect invocation is not asserted.

The server follows the ADR’s document-head recipe: optional layer order, one full
`<style data-openui-styles>`, then app CSS and the initially disabled single-class
override stylesheet. The browser inherits its layer from the server sheet.
`tests/contract.ts` checks post-interaction sheets locally because the shared
`smoke()` always navigates; all shared assertions stay enabled.

## Run

From the repository root:

```sh
node fork/examples/compat/scripts/install-library.mjs strict-hydration --update-lockfile
OPENUI_COMPAT_MODE=unlayered pnpm --dir fork/examples/compat/strict-hydration build
pnpm --dir fork/examples/compat/strict-hydration start --port 5752
OPENUI_COMPAT_MODE=unlayered pnpm --dir fork/examples/compat/strict-hydration test:smoke --list
pnpm --dir fork/examples/compat smoke strict-hydration
```

Use `--update-lockfile` only for initial creation or an intentional dependency change.
The last command owns install/build/server cleanup and runs Chromium in both modes.
It must run on the orchestrator; this sandbox cannot launch Chromium.

## Findings

No strict-mode-specific defect has been established without Chromium.

No shared harness files or library files are changed. No assertion is disabled.
