## Summary

Button and IconButton currently attach generated Goober classes to their roots, so ordinary consumer CSS cannot reliably target the base styles through stable hooks. This pilot moves owned rules to `openui-button-root` and `openui-icon-button-root` using stock nested Goober CSS, with a private zero-specificity html guard. Existing aliases, props, appearance and token fallbacks remain intact.

```text
packages/react-components/
  src/components/{Button,IconButton}/  stable root targets
  src/styles/base.ts                  explicit shared border-box opt-in
  README.md                           override contract and conversion ledger
```

Stacked on PR67's frozen accepted60 commit. Only these two component families and the already-shared one-declaration base helper are converted; later tickets remain gated on independent review.

## Evidence

The failed flat selector emitted an extra generated class outside `:where()`, preventing ordinary overrides. Standard nested CSS emits the intended zero-specificity guard; actual CSSOM and computed base/variant/size/state/part override checks pass. Failed trials and initial assertion defects remain separate evidence, not passing records.

Matched package consumers cover plain CSS/Tailwind v3/v4, both stylesheet orders, host Goober globals before/after, native keyboard/callback/disabled/ref/asChild behavior, themes, shared roots, Calendar/Select, chart controls, optimized imports and lazy mount orders. Build/types, 166 native ESM/CJS exports, 440 unchanged declaration files and all 1,444 fallback expressions pass. Exact source/archive/result bindings are recorded in the lab evidence.

A bundler shared lazy chunk registers both retained pilot components' styles on first use in both baseline and candidate. Single-component optimized entries prune the unused counterpart; no per-component lazy stylesheet isolation is promised or patched.

## Merge danger

**Door:** beta component styling and the root-only box-sizing helper. Ordinary overrides require matching later unlayered selectors; this does not change the deferred SSR boundary.

**Blast radius:** Button/IconButton consumers, including indirect chart controls, and shared box sizing on Buttons/FormControl/TagBlock. Legacy react-ui, chart source, kits, dependencies, CI and releases are untouched. Independent pilot acceptance is pending; do not treat this draft as permission to start #62–64. PR67 and PR42 heads remain unchanged.
