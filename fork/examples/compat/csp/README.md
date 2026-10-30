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

- **Fixed in the component library (c0119dca):** the layer-order tag and ThemeProvider's theme
  tag never got `window.__nonce__`, and the token defaults tag and the component sheet got it only
  after insertion. Each raised a `style-src-elem` violation, and the first two stayed blocked.
  Every style tag now carries the nonce from creation; the spec allows no `style-src-elem`
  violation and requires the nonce on every tag.
- **Known limitation, pinned:** React serializes `style` props into server HTML as attributes,
  which a nonce never covers. The policy blocks five of them while the HTML is parsed: four from
  Radix (SelectValue, Select's hidden native select, TabsList's roving focus group, TabsContent's
  presence) and MiniLineChart's size frame, which therefore stays at its container's size even
  after hydration. React's later CSSOM writes are allowed. Production react-ui renders the same
  attributes. `KNOWN_SERVER_STYLE_ATTRIBUTES` in the spec lists them exactly, matched against the
  server HTML, the violation events and each console report's attribute hash; any other
  attribute or error still fails. The policy is not relaxed. The shared smoke's console check
  is off only because it has no allowlist; the spec runs the same capture with those five
  reports removed.

No shared harness files are changed.
