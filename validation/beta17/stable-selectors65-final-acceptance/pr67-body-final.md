## Summary

Register 215 canonical light-theme token defaults automatically on the document root and share border-box only across the existing Buttons, FormControl and TagBlock roots. Public imports need no CSS import, provider or setup command.

```text
src/styles/
├── defaults.ts  canonical light tokens in the lowest-priority layer
└── base.ts      root-only border-box opt-in for three existing components
```

All 1,444 component fallback expressions remain: clearing a token with initial still uses the component's existing default. Broad fallback deletion in #58 is deferred by user decision. Stacked on frozen #42. Related: #55, #57, #58, #59, #60.

## Evidence

- **Before:** repeated root declarations and local fallback defaults.
  **After:** automatic canonical root defaults plus one shared root rule, preserving fallback behavior and unrelated host styles.
- 453 combined worker browser checks and 39 optimized-origin checks pass; build/typecheck, strict consumer types and 166 native ESM/CJS exports pass.
- **340 valid independent checks accepted** within #60 common-style scope, separate from worker evidence. The preserved 120 invalid gap assertions are explicitly reassessed against unchanged raw DOM observations; they are not additional browser runs or relabeled raw successes.
- Plain CSS/Tailwind v3/v4, stylesheet order, cleared/inherited/container tokens, host globals/layers, themes, portals, syntax-theme delivery and repeated registration are covered within the report's scope.
- [Independent #60 report](https://github.com/ankit-thesys/openui-comp/blob/59106f0b7899ecd6c436f38bc175fc8b9ac6ea60/validation/beta17/shared-styles55/60-independent/REPORT.md) · [Worker report](https://github.com/ankit-thesys/openui-comp/blob/59106f0b7899ecd6c436f38bc175fc8b9ac6ea60/validation/beta17/shared-styles55/60/REPORT.md).

Frozen source `c1aaf994d5c0fbfb56b83685221eeea9b409e57c`; archive SHA256 `1db41852f9e5aa11ccbfe5a56cdb3d00c8ad753ad5e73cb19bdf4832e7f7b957`. This draft is scoped accepted evidence, not merge/release or full beta approval. The stable-selector pilot and later family migration belong to #68/#69 and are not included in this source head. No source CI pass is claimed.

## Merge Danger

**Door:** two-way

Reverting restores the previous additive-package styling; no data migration.

**Blast Radius:** styling

Root custom-property inheritance and three shared component roots. Legacy packages, charts, kits, dependencies and CI/release tooling are unchanged. SSR/hydration, streaming, performance/memory and full beta acceptance remain outside this gate. Fallback deletion stays deferred.
