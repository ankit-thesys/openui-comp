# csp: compatibility #169

Standalone production Vite SSR fixture on **5750**. Both `unlayered` and `layered`
(`openui`) modes are supported. React/React DOM 19.3.1 and Vite 8.3.5 are pinned to
current stable registry releases. TypeScript is 7.0.2. Playwright remains 1.56.1 as
required by the harness; Zustand remains in the library-supported 4.x peer range.

A fresh request nonce is applied to the full server component sheet, app CSS links, and bootstrap scripts. The bootstrap sets `window.__nonce__` and collects `securitypolicyviolation` events before any browser imports. A lazy module registers a unique `css` rule and `keyframes` absent from the server sheet. The spec checks computed lazy styling, request/header nonce agreement, every style tag’s nonce, zero CSP events, and zero console/hydration errors. A JavaScript-disabled context checks the server path against the default Button values.

The server follows the ADR’s document-head recipe: optional layer order, one full
`<style data-openui-styles>`, then app CSS and the initially disabled single-class
override stylesheet. The browser inherits its layer from the server sheet.
`tests/contract.ts` checks post-interaction sheets locally because the shared
`smoke()` always navigates; all shared assertions stay enabled.

## Run

From the repository root:

```sh
node fork/examples/compat/scripts/install-library.mjs csp --update-lockfile
OPENUI_COMPAT_MODE=unlayered pnpm --dir fork/examples/compat/csp build
pnpm --dir fork/examples/compat/csp start --port 5750
OPENUI_COMPAT_MODE=unlayered pnpm --dir fork/examples/compat/csp test:smoke --list
pnpm --dir fork/examples/compat smoke csp
```

Use `--update-lockfile` only for initial creation or an intentional dependency change.
The last command owns install/build/server cleanup and runs Chromium in both modes.
It must run on the orchestrator; this sandbox cannot launch Chromium.

## Findings

Source inspection identifies missing nonce propagation on the default layer-order tag and ThemeProvider’s insertion-effect tag. The zero-violation assertions remain enabled. Server HTML also lacks theme tokens; the server default-value assertion intentionally retains the expected 8px radius and 10px padding from the harness baseline.

No shared harness files or library files are changed. No assertion is disabled.
