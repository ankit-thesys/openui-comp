# Ticket #169 report

## Apps and modes built

All four are standalone Vite SSR production apps with exact versions, React 19,
local pnpm workspace boundaries, pnpm-generated lockfiles, and the packed library
file dependency. Both `unlayered` and `layered` (`openui`) modes are built.

| App                          | Port | Build/typecheck | Playwright list | Production start + curl | Sheet bytes (UTF-8) |
| ---------------------------- | ---- | --------------- | --------------- | ----------------------- | ------------------- |
| csp / unlayered              | 5750 | PASS            | PASS            | PASS                    | 211068              |
| csp / layered                | 5750 | PASS            | PASS            | PASS                    | 211083              |
| lib-on-top / unlayered       | 5751 | PASS            | PASS            | PASS                    | 211293              |
| lib-on-top / layered         | 5751 | PASS            | PASS            | PASS                    | 211308              |
| strict-hydration / unlayered | 5752 | PASS            | PASS            | PASS                    | 211068              |
| strict-hydration / layered   | 5752 | PASS            | PASS            | PASS                    | 211083              |
| dark-mode / unlayered        | 5753 | PASS            | PASS            | PASS                    | 211068              |
| dark-mode / layered          | 5753 | PASS            | PASS            | PASS                    | 211083              |

`strict-hydration` wraps server and browser trees in StrictMode. Each start script explicitly sets `NODE_ENV=production`. No development
mode was requested or added. The listed specs contain 3 tests for csp, 3 for
lib-on-top, 2 for strict-hydration, and 3 for dark-mode, in each build mode.

## Commands and results

Run from the repository root; `<app>` means each of the four names above.

| Command                                                                                                                    | Result                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `gh issue view 169 --repo ankit-thesys/openui-comp --json title,body`                                                      | PASS                                                                                                                   |
| `gh issue view 162 --repo ankit-thesys/openui-comp --json title,body`                                                      | PASS                                                                                                                   |
| `node fork/examples/compat/scripts/install-library.mjs <app> --update-lockfile`                                            | PASS, all four apps; installers ran sequentially                                                                       |
| `OPENUI_COMPAT_MODE=<mode> pnpm --dir fork/examples/compat/<app> build`                                                    | PASS, all eight builds; includes app, local helper, and spec typechecking                                              |
| `OPENUI_COMPAT_MODE=<mode> pnpm --dir fork/examples/compat/<app> test:smoke --list`                                        | PASS, all eight listings; no browser launched                                                                          |
| `pnpm --dir fork/examples/compat/<app> start --port <declared-port>`                                                       | PASS, all eight production starts; servers stopped afterwards                                                          |
| `curl --fail --silent --show-error -D <headers> http://127.0.0.1:<port>/ -o <html>`                                        | PASS, all eight HTML responses and linked CSS fetches                                                                  |
| `pnpm exec prettier --check 'fork/examples/compat/{csp,lib-on-top,strict-hydration,dark-mode}/**/*.{ts,tsx,mjs,json,css}'` | PASS; lockfiles excluded                                                                                               |
| `git diff --check`                                                                                                         | PASS; new source files also checked by Prettier                                                                        |
| `npm view ... version` using the default user cache                                                                        | FAIL, sandbox could not write the user cache; retried successfully with `npm_config_cache=/private/tmp/openui-169-npm` |
| Initial strict-hydration build started before its installation finished                                                    | FAIL, missing node/vite types; after installation, both complete builds PASS                                           |
| Chromium smoke execution                                                                                                   | NOT RUN, prohibited in this sandbox                                                                                    |

Registry stable tags confirmed React/React DOM 19.3.1, Vite 8.3.5, TypeScript 7.0.2,
React types 19.3.0, and Zod 4.6.7. Playwright deliberately matches the harness’s
required 1.56.1; Zustand 4.5.7 stays in the library-supported 4.x range. React and
Vite releases were also checked against [React’s release page](https://react.dev/versions)
and [Vite’s release policy](https://vite.dev/releases).

## Curl checks of server HTML

Every response was HTTP 200, `text/html; charset=utf-8`, with exactly one nonempty
`style[data-openui-styles]` inside head, before all app stylesheet links. Layered
responses start that sheet with `@layer openui{`; unlayered responses do not. The
layer-order statement precedes the component sheet in layered mode. Both linked
CSS resources return HTTP 200, including the initially disabled single-class override.
Rendered mode markers match the build. These are structural checks; curl cannot
verify computed styles or detect browser CSP events.

CSP responses carry a fresh nonce matching the header, every server style tag,
stylesheet links, scripts and `window.__nonce__`. The unique lazy rule is absent
from the server component sheet. The local library’s card, badge and keyframe
rules each occur once, including its not-yet-rendered badge’s rule.

**Server theme observation:** all eight HTML responses contain zero declarations
of `--openui-text-neutral-primary`, and no provider theme style tag. The dark page
therefore lacks its required dark token values before hydration.

## Library bugs

### 1. Strict nonce CSP is not propagated to all library style writes

Minimal reproduction: run `smoke csp` below, or serve csp and inspect its spec’s
“hydration and a genuinely new browser rule” test. The server supplies a valid
`style-src 'nonce-…'`, a nonced server sheet, and `window.__nonce__` before imports.
Then hydrate ThemeProvider and click “Load browser component”.

Expected: every library style tag uses the request nonce, no CSP events, and the
lazy component is styled. Actual source behavior: `styles/defaults.ts` prepends
`style[data-openui-layer-order]` without a nonce; ThemeProvider’s insertion effect
appends `style[data-openui-theme]` without one. The token-default sheet itself is
passed through Goober, which applies `window.__nonce__`; the separate layer-order
tag is the missing defaults nonce path. The append-only component writer does
read the nonce. Chromium must confirm the resulting violation event log; the
strict zero-event and all-style-tags-have-the-nonce assertions remain enabled.

The same server HTML also contains nonced-CSP-incompatible **style attributes**:
Radix’s hidden span/select, TabsList `outline:none`, TabsContent animation duration,
and MiniLineChart dimensions. These are confirmed in fetched HTML. A style-tag
nonce does not authorize style attributes. The unchanged shared samples and
zero-violation assertion preserve coverage of these paths too.

### 2. SSR does not emit theme defaults or ThemeProvider tokens

Minimal reproduction: serve `dark-mode` at `/` and inspect its HTML, then run its
“dark defaults apply to server HTML before hydration” test with JavaScript disabled.
The app uses only documented `<ThemeProvider mode="dark">` and the `/styles`
collector, with no app-owned theme tokens.

Expected: the server probe resolves the default dark `textNeutralPrimary` token,
`oklch(0.985 0 89.876 / 1)`, before hydration, with no flash; light defaults should
also match the harness baseline before hydration. Actual confirmed HTML has no
theme token declarations or provider style tag. Diagnosis: default registration
is guarded by `typeof document !== "undefined"`; ThemeProvider injects variables
only through `useInsertionEffect`, which does not emit server styles. The full
component collector contains component rules, not default/provider token output.
The probe thus has no server token to inherit. The browser computed color and
flash flag remain to be measured by the orchestrator. The light server-path test
also retains the harness’s expected Button radius/padding instead of accepting
its different component fallback values.

No library changes or local token/nonce patches were made. No shared assertions
were disabled. These findings belong on #163’s branch; browser results should
accompany any fixes.

## Harness changes needed

None. There is no proposed shared diff. Each app keeps a small local sheet check
for the state after an interaction, since calling shared `smoke()` again would
navigate away from that state. The app’s one smoke spec still calls shared smoke
with every assertion enabled.

## Orchestrator commands

```sh
pnpm --dir fork/examples/compat smoke csp
pnpm --dir fork/examples/compat smoke lib-on-top
pnpm --dir fork/examples/compat smoke strict-hydration
pnpm --dir fork/examples/compat smoke dark-mode
```

Each command installs the tarball and runs both production modes in Chromium.
CSP and server dark-mode assertions are expected to expose the findings above;
do not relax them. The dark browser test attaches `first-paint.json`, including
the pre-module sample, hydration-frame samples, and `flashed` boolean. The test holds the client module until two animation frames have rendered the server HTML. It tests
both toggle directions before asserting that first paint had no flash.

## Open questions

No implementation clarification is needed. Browser-computed values, CSP violation
logs, hydration warnings and CSSOM duplicate checks await the orchestrator.
The server theme and nonce gaps require library-side resolution in #163.

## Files changed

Only the four app directories below are new. No root lockfile, shared harness,
other app, or component-library source was edited. All changes are uncommitted.
Generated builds, dependencies and browser artifacts are ignored.

### `csp/`

- `README.md`
- `REPORT.md`
- `package.json`
- `playwright.config.ts`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `public/overrides.css`
- `server.mjs`
- `src/App.tsx`
- `src/Lazy.tsx`
- `src/app.css`
- `src/entry-client.tsx`
- `src/entry-server.tsx`
- `src/env.d.ts`
- `tests/contract.ts`
- `tests/smoke.spec.ts`
- `tsconfig.json`
- `vite.config.ts`

### `lib-on-top/`

- `README.md`
- `package.json`
- `playwright.config.ts`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `public/overrides.css`
- `server.mjs`
- `src/App.tsx`
- `src/Lazy.tsx`
- `src/app.css`
- `src/entry-client.tsx`
- `src/entry-server.tsx`
- `src/env.d.ts`
- `src/tiny-library/LazyBadge.tsx`
- `src/tiny-library/index.tsx`
- `src/tiny-library/priceBadge.styles.ts`
- `src/tiny-library/priceCard.styles.ts`
- `src/tiny-library/styles.ts`
- `tests/contract.ts`
- `tests/smoke.spec.ts`
- `tsconfig.json`
- `vite.config.ts`

### `strict-hydration/`

- `README.md`
- `package.json`
- `playwright.config.ts`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `public/overrides.css`
- `server.mjs`
- `src/App.tsx`
- `src/Lazy.tsx`
- `src/app.css`
- `src/entry-client.tsx`
- `src/entry-server.tsx`
- `src/env.d.ts`
- `tests/contract.ts`
- `tests/smoke.spec.ts`
- `tsconfig.json`
- `vite.config.ts`

### `dark-mode/`

- `README.md`
- `package.json`
- `playwright.config.ts`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `public/overrides.css`
- `server.mjs`
- `src/App.tsx`
- `src/app.css`
- `src/entry-client.tsx`
- `src/entry-server.tsx`
- `src/env.d.ts`
- `tests/contract.ts`
- `tests/smoke.spec.ts`
- `tsconfig.json`
- `vite.config.ts`
