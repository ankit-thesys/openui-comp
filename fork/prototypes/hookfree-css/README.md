# PROTOTYPE: hook-free `css`, layer applied when the sheet is written

Throwaway. Lives only on the `prototype/hookfree-css` branch.

**Question:** can the library export a plain `css` tag (no `useStyles` hook) and still put
every rule in an app-wide cascade layer, when module-level `css` calls run at import time,
before the app calls `configureStyles({ layer })`?

**Idea:** class names never depend on the layer. Goober writes rules into our own store (a fake
target passed through `css.bind({ target })`); the layer wraps the whole sheet when it is written,
so `configureStyles` can come before or after any registration.

## Run it

- Server: `node server-check.mjs`
- Browser: `python3 -m http.server 5630`, then open http://localhost:5630 (Tailwind 4 browser build
  from the CDN; buttons switch layer mode, load a lazy module, and run goober's `glob`/`extractCss`
  as a host app would).

## Verdict: it works

| Check | Server | Browser (Tailwind 4) |
| --- | --- | --- |
| Import-time rule ends up layered after a later `configureStyles` | PASS | PASS |
| Lazily imported rule (and its keyframes) lands in the same layer | PASS | PASS |
| One `@layer openui{…}` wrapper for the whole sheet | PASS | PASS |
| Switching to unlayered and back rewrites the sheet | PASS | PASS |
| Preflight (`base`) does not reset the library; `bg-red-500 rounded-full` beat it | n/a | PASS |
| Unlayered: the library beats the utility, as expected | n/a | PASS |
| Host app's goober `glob` / `extractCss` leave our sheet alone | n/a | PASS |

Findings to carry into the real implementation:

1. **`keyframes` must be `css.bind({ target, k: 1 })`.** Goober's exported `keyframes` is already
   bound, so binding it again silently drops the target and the keyframes land in goober's own sheet.
2. **Batch the sheet writes.** Rewriting the `<style>` text on every registration re-parses the whole
   sheet: 1000 rules took ~490 ms. One rewrite per microtask brought it to ~53 ms (+4 ms flush), and
   it still lands before paint.
3. **Relies on goober 2.1.19's `getSheet` target shape** (`querySelector` → `.parentNode`,
   `.firstChild.data` in the browser; `.data` on the server). Pin the exact version and cover it with
   a test, or replace goober's compiler with our own.
4. **Not covered here:** React rendering (irrelevant: `css` returns strings), `defaults.ts` moving its
   theme variables to their own tag (inside the wrapper `@layer openui-defaults` would nest), and a
   component measuring itself in `useLayoutEffect` in the same task as a lazy registration (the
   batched write lands one microtask later).
