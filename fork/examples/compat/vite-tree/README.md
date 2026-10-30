# Vite tree-shaking compatibility (#167)

Port **5730**. Production modes: **unlayered** and **layered**. React 19.3.1, Vite 8.3.5.

`src/main.tsx` imports exactly one component, Button, plus `configureStyles`. It intentionally
uses the automatic light root tokens rather than importing ThemeProvider. Its smoke passes only
the shared baseline's Button sample to `shared/smoke.ts`; all sheet, duplicate, override, layer,
and console checks remain enabled. The existing `vite-spa` owns the full plain-SPA sample set.

`pnpm build` typechecks the app and spec, then builds two real SPAs:

- `dist/`: Button only.
- `dist/comparison/`: namespace import with every export exposed on `window`, retaining all
  exports and their lazy chunks. The comparison is also available at `/comparison/`.

Both are production builds with JS minification disabled to preserve auditable module-boundary
comments. `scripts/build.mjs` reads the emitted JS/CSS, without source maps or library source
reads. It asserts that the only retained `*.styles.mjs` module is Button's, checks actual Button
background, padding and box-sizing declarations, rejects other component-private CSS variables,
and requires the all-export control to retain more than 50 style modules. Raw and gzip output
sizes must both be smaller. Token defaults and the CSS runtime are allowed dependencies.
`dist/tree-report.json` records the inventory and sizes, and the smoke also checks this report
and the actual browser sheet. This is a retention test, not a minified-size benchmark.

From the repository root:

```sh
node fork/examples/compat/scripts/install-library.mjs vite-tree --update-lockfile
pnpm --dir fork/examples/compat smoke vite-tree --list-tests
pnpm --dir fork/examples/compat smoke vite-tree
```

Only use `--update-lockfile` to create or intentionally refresh the lockfile. Ordinary harness
runs check third-party resolution stability. No Chromium was launched in the implementation
sandbox; the last command must run on the orchestrator.
